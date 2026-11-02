# syntax=docker/dockerfile:1
FROM ghcr.io/astral-sh/uv:0.13.6 AS uv
FROM python:3.15.1-slim-trixie AS build
COPY --from=uv /uv /usr/local/bin/uv
WORKDIR /app
ENV UV_PYTHON_DOWNLOADS=never UV_LINK_MODE=copy
RUN apt-get update && apt-get install -y --no-install-recommends build-essential git \
    && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml uv.lock README.md LICENSE setup.py MANIFEST.in ./
COPY src ./src
COPY migrations ./migrations
COPY web ./web
COPY resources ./resources
COPY tools/amane-bridge ./tools/amane-bridge
COPY scripts/write_reporting_config.py ./scripts/
COPY scripts/build_amane_runtime.py scripts/amane_bridge.spec ./scripts/
# vision 带上 OpenCV：镜像里随附的人脸模型要靠它才能检出与比对。
RUN uv sync --locked --no-dev --no-editable --extra vision
RUN .venv/bin/python -X utf8 scripts/build_amane_runtime.py --kind python \
    --destination /app/amane-runtime --work /app/build/amane-runtime
# 公开 DSN 写进 wheel 的资源目录；发行流水线传 PEACH_REQUIRE_REPORTING=1，缺失时构建失败。
ARG PEACH_SENTRY_DSN="" PEACH_LIBRARY_SENTRY_DSN="" PEACH_REQUIRE_REPORTING=""
RUN target="$(.venv/bin/python -c 'import pathlib, peach; print(pathlib.Path(peach.__file__).parent / "_resources" / "sentry.json")')" \
    && .venv/bin/python scripts/write_reporting_config.py --output "$target" ${PEACH_REQUIRE_REPORTING:+--require}

FROM python:3.15.1-slim-trixie
LABEL org.opencontainers.image.title="Peach" \
      org.opencontainers.image.source="https://github.com/peach-mitao/peach" \
      org.opencontainers.image.licenses="AGPL-3.0-or-later"
# amane 独立环境在构建阶段准备，空数据卷可直接调用。
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg openssl ca-certificates mesa-va-drivers vainfo \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1000 peach && useradd --uid 1000 --gid 1000 --create-home peach \
    && mkdir /data && chown peach:peach /data
# 人脸模型与许可证随镜像分发，地址与哈希同 scripts/fetch_face_models.py，运行时经 PEACH_FACE_MODELS 读取。
ADD --chmod=a+rX --checksum=sha256:8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4 \
    https://media.githubusercontent.com/media/opencv/opencv_zoo/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_detection_yunet/face_detection_yunet_2023mar.onnx \
    /app/tools/face-models/face_detection_yunet_2023mar.onnx
ADD --chmod=a+rX --checksum=sha256:0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79 \
    https://media.githubusercontent.com/media/opencv/opencv_zoo/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_recognition_sface/face_recognition_sface_2021dec.onnx \
    /app/tools/face-models/face_recognition_sface_2021dec.onnx
ADD --chmod=a+rX --checksum=sha256:c83b8120c50ccbd4c4f96edf53141bdd566ebb8f8e9227e415326aa1b1aba958 \
    https://raw.githubusercontent.com/opencv/opencv_zoo/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_detection_yunet/LICENSE \
    /app/tools/face-models/LICENSE-yunet.txt
ADD --chmod=a+rX --checksum=sha256:cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30 \
    https://raw.githubusercontent.com/opencv/opencv_zoo/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_recognition_sface/LICENSE \
    /app/tools/face-models/LICENSE-sface.txt
COPY --from=build /app/.venv /app/.venv
COPY --from=build /app/amane-runtime /app/amane-runtime
COPY --from=build /app/tools/amane-bridge /app/tools/amane-bridge
RUN /app/amane-runtime/.venv/bin/python -X utf8 /app/tools/amane-bridge/bridge.py --self-check
ENV PATH="/app/.venv/bin:$PATH" PEACH_DATA_ROOT=/data PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=utf-8 PYTHONUTF8=1 PEACH_FACE_MODELS=/app/tools/face-models PEACH_DISTRIBUTION=docker \
    PEACH_AMANE_RUNTIME=/app/amane-runtime
WORKDIR /data
USER peach
EXPOSE 8900
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8900/healthz?ready=1', timeout=3).read()"]
ENTRYPOINT ["python", "-m", "peach.server"]
