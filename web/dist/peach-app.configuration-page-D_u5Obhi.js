(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "6fdcae45-fda4-4a59-8633-a78cc41397a6", e._sentryDebugIdIdentifier = "sentry-dbid-6fdcae45-fda4-4a59-8633-a78cc41397a6");
	} catch {}
})();
import { $2ec61d1d4f780267$export$a8a3e93435678ff9 as e, $3a442827418ebe87$export$eb2fcfdbd7ba97d4 as t, $542a13ca2fa5b484$export$5b6b19405a83ff9d as n, $72abaeab4d80592f$export$78efe591171d7d45 as r, $bd263d78e9bf3c56$export$f5c9f3c2c4054eec as i, $ea3928288112382f$export$439d29a4e110a164 as a, $f2ff30fde7b014be$export$3ddf2d174ce01153 as o, $fe21c36db05242bb$export$a98f0dcb43a68a25 as s, $fe21c36db05242bb$export$d7b12c4107be0d61 as c, ACCENTS as l, ApiError as u, Button as d, ButtonLink as f, CLOUD_LOCATIONS as p, CLOUD_PROXY_HELP as m, CONFIGURATION_KEY as h, CONFIGURATION_URL as g, CREDENTIAL_STATE as _, Checkbox as v, Chip as y, Disclosure as b, ENTRY_LINKS_HELP as x, ENTRY_LINKS_HINT as S, EmptyState as ee, ErrorText as C, ExternalLink as w, FEED_SCHEDULE_KEY as T, FOLLOW_CREDENTIALS_KEY as E, FOLLOW_INITIAL_RANGE_OPTIONS as D, FOLLOW_SCHEDULE_KEY as O, Fact as k, FactList as te, FieldLabel as ne, Footer as A, Help as j, HintText as re, Input as M, LIBRARY_FOLDER_HELP as ie, LIBRARY_PROCESSING_KEY as ae, Label as oe, LinkButton as se, LoadingDots as ce, M6 as le, MEDIA_PROCESSING_KEY as ue, MEDIA_PROCESSING_URL as de, MEDIA_SOURCE_ICONS as fe, MENU_POPOVER_SURFACE as pe, Note as N, PICK_FOLDER_URL as me, POLICY_COLUMNS as he, POLICY_COVER_NOTE as ge, POLICY_MATRIX as _e, POLICY_SUMMARY as ve, PathLine as ye, PillTabList as be, Progress as xe, Rows as P, SEGMENT as Se, SEGMENTED_TRACK as Ce, SETTINGS_KEY as we, SETTINGS_URL as Te, Section as F, SectionSkeleton as Ee, SegmentedRadioGroup as De, Select as Oe, Select$1 as I, SelectItem as L, SettingsCard as ke, SettingsRow as R, SiteLabel as Ae, SourceLabel as z, SourceMark as je, Stack as B, StatusLabel as V, Switch as H, THUMBNAIL_JOBS_KEY as Me, TextField as Ne, TextFieldContext as Pe, __toESM as Fe, apiGet as U, apiSend as W, appSettingsStore as Ie, boundedPreference as Le, busyProps as G, cardClass as Re, cloudProxySkeleton as ze, cn as Be, confirmModal as Ve, credentialDone as He, credentialsSkeleton as Ue, cx as We, errorMessage as K, fetchConfiguration as Ge, fetchCredentials as Ke, fetchFeedSchedule as qe, fetchFollowSchedule as Je, fetchMediaProcessing as Ye, fetchSettings as Xe, fetchThumbnailJobs as Ze, fmtSize as Qe, indexersSkeleton as $e, javBrowserSkeleton as et, momentText as tt, overlayHost as nt, peachHistory$1 as rt, previewLibraryColor as it, providerIcon as at, queryClient as q, randomId as ot, rememberShape as J, require_jsx_runtime as st, require_react as ct, saveCredential as lt, schedulePollInterval as ut, settingsPath as dt, shellNavigate as ft, sortCx as pt, sourceDefaultCost as mt, useAction as Y, useClientUpdates as ht, useLibraryTints as gt, useMutation as _t, useQuery as X, useRunSchedule as vt, useSaveFollowSchedule as yt, useSaveSettings as bt, useSaveThumbnailMode as xt } from "./peach-app.js";
import { CodeBlock as St } from "./peach-app.code-block-CyDva4Ms.js";
import { FolderField as Ct, FolderFieldLine as wt, FolderRow as Tt, MEDIA_SOURCES as Et, MediaReadPolicy as Dt, MediaReadPolicyHelp as Ot, SourceSelect as kt, isCloudSource as At, sourceMark as jt, useFolderRows as Mt } from "./peach-app.folder-rows-BWBfTyUD.js";
import { ConnectionStatus as Nt } from "./peach-app.connection-status-DI6kgn3i.js";
import { SourceIcon as Pt } from "./peach-app.source-view-DalWfDkm.js";
// src/react/settings/configuration-panel.ts
var Z = /* @__PURE__ */ Fe(ct(), 1), Ft = "flex flex-col gap-6";
function Q(e) {
	return e ? {
		className: e.active ? `${Ft} ui-board-group-active` : Ft,
		"data-board-group": String(e.index),
		id: e.id,
		role: "tabpanel",
		"aria-labelledby": e.labelledBy
	} : { className: Ft };
}
// src/react/settings/userscript-probe.ts
function It() {
	let e = (0, Z.useRef)(null), [t, n] = (0, Z.useState)(0), [r, i] = (0, Z.useState)("checking");
	return (0, Z.useEffect)(() => {
		let t = ot(), n = !1, r = e.current, a, o = () => {
			n = !0, clearInterval(u), i("missing");
		}, s = () => {
			n || (clearTimeout(a), a = setTimeout(o, 3e3), c());
		}, c = () => e.current?.contentWindow?.postMessage({
			type: "peach-userscript:probe",
			nonce: t
		}, window.location.origin), l = (r) => {
			!n && r.source === e.current?.contentWindow && r.origin === window.location.origin && r.data?.type === "peach-userscript:ready" && r.data.nonce === t && r.data.protocol === 1 && typeof r.data.version == "string" && /^\d{1,5}\.\d{1,5}\.\d{1,5}$/.test(r.data.version) && typeof r.data.paired == "boolean" && (n = !0, clearInterval(u), clearTimeout(a), i({
				version: r.data.version,
				paired: r.data.paired
			}));
		};
		window.addEventListener("message", l);
		let u = setInterval(c, 250);
		return a = setTimeout(o, 15e3), r?.addEventListener("load", s), r?.contentDocument?.readyState === "complete" && r.contentDocument.URL !== "about:blank" && s(), c(), () => {
			clearInterval(u), clearTimeout(a), r?.removeEventListener("load", s), window.removeEventListener("message", l);
		};
	}, [t]), {
		frame: e,
		attempt: t,
		status: r,
		retry: () => {
			r !== "checking" && (i("checking"), n((e) => e + 1));
		}
	};
}
// src/react/settings/userscript-status.tsx
var $ = st();
function Lt(e, t) {
	let n = e.split(".").map(Number), r = t.split(".").map(Number);
	for (let e = 0; e < 3; e++) if (n[e] !== r[e]) return n[e] > r[e];
	return !0;
}
function Rt({ enabled: e, release: t }) {
	let { frame: n, attempt: r, status: i, retry: a } = It(), o = typeof i == "object", s = o && !Lt(i.version, t.minimum_version), c = o && !Lt(i.version, t.version), l = i === "checking" ? "progress" : i === "missing" ? "neutral" : s || c || !i.paired ? "warning" : "success", u = i === "checking" ? "检测中" : i === "missing" ? "未检测到" : s ? "需更新" : c ? "可更新" : i.paired ? "已连接" : "待配对", f = i === "checking" ? "checking" : i === "missing" ? "missing" : s ? "required" : c ? "available" : i.paired ? e ? "enabled" : "disabled" : "unpaired";
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("iframe", {
		ref: n,
		title: "Peach 用户脚本检测",
		hidden: !0,
		src: "/integrations/peach-userscript-bridge"
	}, r), /* @__PURE__ */ (0, $.jsxs)("div", {
		"aria-live": "polite",
		"data-userscript-status": "",
		className: Re({
			variant: "raised",
			bordered: "line",
			className: "flex flex-col gap-3"
		}),
		children: [
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, $.jsx)("span", {
					className: "text-body-medium text-text-primary",
					children: "Peach 用户脚本"
				}), /* @__PURE__ */ (0, $.jsx)(Nt, {
					tone: l,
					children: /* @__PURE__ */ (0, $.jsx)("span", {
						"data-copy-key": `userscript.${f}.status`,
						children: u
					})
				})]
			}),
			o ? /* @__PURE__ */ (0, $.jsxs)("p", {
				"data-copy-key": "userscript.installed.version",
				className: "text-body-regular text-text-secondary",
				children: ["用户脚本 v", i.version]
			}) : null,
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, $.jsx)("span", {
					className: "text-body-regular text-text-secondary",
					children: "浏览器添加"
				}), /* @__PURE__ */ (0, $.jsx)(V, {
					tone: e ? "success" : "neutral",
					children: /* @__PURE__ */ (0, $.jsx)("span", {
						"data-copy-key": `userscript.adding.${e ? "enabled" : "disabled"}`,
						children: e ? "已启用" : "未启用"
					})
				})]
			}),
			/* @__PURE__ */ (0, $.jsx)("p", {
				"data-copy-key": `userscript.${f}.message`,
				className: "text-caption-1-regular text-text-secondary",
				children: i === "checking" ? "正在检测当前浏览器的用户脚本。" : i === "missing" ? "确认脚本已启用并更新至最新版。Chrome 还需在 Tampermonkey 扩展详情中开启「允许用户脚本」或开发者模式，并允许访问当前 Peach 站点；刷新页面后重新检测。" : s ? `请更新至 v${t.minimum_version} 或更高版本。` : c ? `用户脚本 v${t.version} 可更新。` : i.paired ? e ? "可在支持的站点直接加入 Peach 馆藏。" : "启用浏览器添加后，可在支持的站点直接加入 Peach 馆藏。" : "生成令牌后复制配对信息，在用户脚本设置中粘贴并保存。"
			}),
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					i === "missing" || s || c ? /* @__PURE__ */ (0, $.jsx)(w, {
						href: t.install_url,
						children: /* @__PURE__ */ (0, $.jsx)("span", {
							"data-copy-key": `userscript.${i === "missing" ? "install" : "update"}.action`,
							children: s || c ? "更新用户脚本" : "安装 Peach 用户脚本"
						})
					}) : null,
					i === "missing" ? /* @__PURE__ */ (0, $.jsx)(w, {
						href: "https://www.tampermonkey.net/faq.php#Q209",
						children: "Tampermonkey 权限设置说明"
					}) : null,
					/* @__PURE__ */ (0, $.jsx)(d, {
						variant: "secondary",
						type: "button",
						...G(i === "checking"),
						onClick: a,
						children: "重新检测"
					})
				]
			})
		]
	})] });
}
// src/react/settings/jav-browser-settings.tsx
var zt = "/api/configuration/jav-browser";
function Bt({ receipt: e, refreshKey: t }) {
	let n = X({
		queryKey: ["jav-browser-settings", t],
		queryFn: ({ signal: e }) => U(zt, e),
		refetchOnMount: "always",
		refetchOnWindowFocus: "always"
	});
	return n.error && !n.data ? /* @__PURE__ */ (0, $.jsx)(C, { children: K(n.error) }) : n.isFetching && !n.data ? /* @__PURE__ */ (0, $.jsx)(Ee, {
		label: "正在读取浏览器添加设置",
		html: et
	}) : n.data ? /* @__PURE__ */ (0, $.jsx)(Vt, {
		initial: n.data,
		receipt: e
	}) : null;
}
function Vt({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)(e.provider), [o, s] = (0, Z.useState)(""), c = Y();
	(0, Z.useEffect)(() => {
		J("javBrowser", {
			enabled: e.enabled,
			ready: e.providers.some((t) => t.key === e.provider && t.configured && t.target)
		}), r(e), a((t) => e.providers.some((e) => e.key === t) ? t : e.provider), e.enabled || s("");
	}, [e]);
	let l = (e) => {
		c.run(e, (t) => W(zt, {
			action: e,
			provider: i
		}, "POST", t), (n) => {
			let { token: i = "", ...o } = n;
			r(o), a(o.provider), s(i), t(e === "disable" ? "已关闭浏览器添加" : "已生成专用令牌");
		});
	}, u = n.providers.some((e) => e.key === i && e.configured && e.target);
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "浏览器添加 JAV",
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, $.jsx)(Rt, {
					enabled: n.enabled,
					release: n.userscript
				}),
				/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, $.jsx)(ne, { children: "浏览器添加的下载渠道" }), /* @__PURE__ */ (0, $.jsx)(I, {
						"aria-label": "浏览器添加的下载渠道",
						selectedKey: i || null,
						placeholder: "暂无可用渠道",
						onSelectionChange: (e) => {
							e !== null && a(String(e));
						},
						isDisabled: !n.providers.length || !!c.busy,
						children: n.providers.map((e) => /* @__PURE__ */ (0, $.jsx)(L, {
							id: e.key,
							textValue: e.label,
							children: /* @__PURE__ */ (0, $.jsx)(z, {
								source: e.key,
								label: e.label
							})
						}, e.key))
					})]
				}),
				u ? null : /* @__PURE__ */ (0, $.jsx)(j, { children: "请在媒体库中添加支持云下载的网盘，并配置账号与目标目录。" }),
				n.problems?.map((e) => /* @__PURE__ */ (0, $.jsx)(j, { children: e }, e)),
				n.enabled && n.active_provider && !n.providers.some((e) => e.key === n.active_provider) ? /* @__PURE__ */ (0, $.jsx)(j, { children: "已启用的下载渠道不可用，请选择渠道并更新令牌。" }) : null,
				/* @__PURE__ */ (0, $.jsx)(M, {
					label: "Peach 地址",
					value: window.location.origin,
					isReadOnly: !0,
					autoComplete: "off"
				}),
				o ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
					/* @__PURE__ */ (0, $.jsx)(M, {
						label: "浏览器添加专用令牌",
						type: "password",
						value: o,
						isReadOnly: !0,
						autoComplete: "new-password"
					}),
					/* @__PURE__ */ (0, $.jsx)("div", { children: /* @__PURE__ */ (0, $.jsx)(d, {
						variant: "secondary",
						type: "button",
						onClick: () => {
							c.run("copy", async () => navigator.clipboard.writeText(JSON.stringify({
								peach_pairing: 1,
								base: window.location.origin,
								token: o
							})), () => t("已复制配对信息"));
						},
						...G(c.busy === "copy"),
						children: "复制配对信息"
					}) }),
					/* @__PURE__ */ (0, $.jsx)(j, { children: "在用户脚本设置的「Peach 地址」中粘贴配对信息，即可填好地址与令牌。" })
				] }) : null
			]
		}), c.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: c.error }) : null] }), /* @__PURE__ */ (0, $.jsxs)(A, { children: [n.enabled ? /* @__PURE__ */ (0, $.jsx)(d, {
			variant: "secondary",
			type: "button",
			disabled: !!c.busy,
			onClick: () => l("disable"),
			children: "关闭浏览器添加"
		}) : null, /* @__PURE__ */ (0, $.jsx)(d, {
			type: "button",
			disabled: !n.available || !u || !!c.busy,
			onClick: () => l(n.enabled ? "rotate" : "enable"),
			...G(c.busy === "enable" || c.busy === "rotate"),
			children: n.enabled ? "更新渠道与令牌" : "启用并生成令牌"
		})] })]
	});
}
// src/react/settings/download-settings.tsx
var Ht = "/api/configuration/downloads", Ut = "/api/configuration/downloads/check", Wt = "/api/configuration/downloads/folder", Gt = "/api/configuration/downloads/pikpak/login", Kt = "/api/configuration/downloads/pikpak/logout", qt = "/api/configuration/downloads/pikpak/browser-login", Jt = 2e3, Yt = at("pikpak");
function Xt({ initial: e, receipt: t, panel: n, issues: r }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		...Q(n),
		children: [r, e ? /* @__PURE__ */ (0, $.jsx)(Zt, {
			initial: e,
			receipt: t
		}) : null]
	});
}
function Zt({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)("");
	(0, Z.useEffect)(() => {
		r((t) => ({
			...t,
			media_sources: e.media_sources,
			pikpak_roots: e.pikpak_roots
		}));
	}, [e.media_sources, e.pikpak_roots]);
	let o = n.media_sources ?? [], s = o.includes("pikpak"), c = o.some((e) => p.includes(e)), l = s && (n.pikpak.logged_in || !!i.trim());
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		c ? /* @__PURE__ */ (0, $.jsx)(Qt, {
			state: n,
			settle: r,
			receipt: t,
			pikpakAccount: l
		}) : null,
		s ? /* @__PURE__ */ (0, $.jsx)(tn, {
			state: n,
			settle: r,
			receipt: t,
			username: i,
			setUsername: a
		}) : null,
		/* @__PURE__ */ (0, $.jsx)(Bt, {
			receipt: t,
			refreshKey: JSON.stringify([
				n.media_sources,
				n.config,
				n.token_set,
				n.pikpak.logged_in
			])
		})
	] });
}
function Qt({ state: e, settle: t, receipt: n, pikpakAccount: r }) {
	let [i, a] = (0, Z.useState)(e.config), [o, s] = (0, Z.useState)(""), [c, l] = (0, Z.useState)(String(e.config.wait_hours)), [u, f] = (0, Z.useState)(null), [p, m] = (0, Z.useState)(""), [h, g] = (0, Z.useState)($t), [_, v] = (0, Z.useState)(""), [y, b] = (0, Z.useState)(!1), x = Y(), S = e.media_sources ?? [], ee = S.includes("115"), w = S.includes("pikpak"), T = (e) => i.targets[e] ?? "", E = (e, t) => a({
		...i,
		targets: {
			...i.targets,
			[e]: t
		}
	}), D = ee && !(!h.target || h.target.exists || T("115") !== h.target.path), O = (e, t, n = "") => {
		let r = t.target ? e.suggested_target : null, i = !!(r && n && r.path === n), o = t.root ? e.suggested_pikpak_root : "";
		a((n) => ({
			...n,
			clouddrive_address: t.address && e.address ? e.address : n.clouddrive_address,
			targets: r && !i ? {
				...n.targets,
				115: r.path
			} : n.targets,
			pikpak_root: o || n.pikpak_root
		})), f(e), m(t.address ? e.address : ""), g({
			target: r,
			root: o,
			saved: i
		}), b(!1), v("");
	};
	return (0, Z.useEffect)(() => {
		if (!e.available || !e.config.clouddrive_address || !e.token_set) return;
		let t = {
			address: !1,
			target: !e.config.targets[115],
			root: !e.config.pikpak_root
		};
		x.run("auto", (e) => U(Ut, e), (e) => O(e, t), (e) => v(K(e)));
	}, []), /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "云下载",
		onSubmit: (e) => {
			if (e.preventDefault(), D) {
				b(!0);
				return;
			}
			let u = !T("115").trim(), d = {
				...i,
				wait_hours: c,
				token: o,
				pikpak_account: r
			};
			x.run("save", (e) => W(Ht, d, "POST", e), (e) => {
				let { report: r, ...i } = e;
				t(i), a(i.config), l(String(i.config.wait_hours)), s(""), r ? O(r, {
					address: !i.config.clouddrive_address,
					target: u,
					root: !i.config.pikpak_root
				}, i.config.targets[115] ?? "") : (f(null), m(""), g($t), b(!1), v("")), n("已保存配置");
			}, (e) => v(K(e)));
		},
		children: [
			e.problems?.length ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "error",
				title: "云下载配置需要检查",
				children: e.problems.join("\n")
			}) }) : null,
			/* @__PURE__ */ (0, $.jsxs)(B, { children: [
				/* @__PURE__ */ (0, $.jsx)(M, {
					label: "CloudDrive2 地址",
					placeholder: "留空自动查找",
					autoComplete: "off",
					maxLength: 200,
					value: i.clouddrive_address,
					isDisabled: !e.available,
					onChange: (e) => a({
						...i,
						clouddrive_address: e
					})
				}),
				/* @__PURE__ */ (0, $.jsx)(M, {
					label: "CloudDrive2 API 令牌",
					type: "password",
					autoComplete: "off",
					maxLength: 400,
					placeholder: e.token_set ? "已保存，留空不改" : "在 CloudDrive2「设置 → API 令牌」中生成",
					hint: "需要离线任务权限。",
					value: o,
					isDisabled: !e.available,
					onChange: s
				}),
				ee ? /* @__PURE__ */ (0, $.jsx)(M, {
					label: /* @__PURE__ */ (0, $.jsx)(z, {
						source: "115",
						label: "115 目标目录"
					}),
					placeholder: "留空时根据媒体库目录自动填写",
					autoComplete: "off",
					maxLength: 300,
					validationBehavior: "aria",
					isInvalid: D,
					hint: D ? y ? "先新建这个目录，或填写已有目录。" : "这个目录不存在。" : "应位于自动入库的云端路径前缀内。",
					value: T("115"),
					isDisabled: !e.available,
					onChange: (e) => E("115", e)
				}) : null,
				w ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(M, {
					label: /* @__PURE__ */ (0, $.jsx)(z, {
						source: "pikpak",
						label: "PikPak 目标目录"
					}),
					placeholder: "以 / 开头的网盘路径",
					autoComplete: "off",
					maxLength: 300,
					hint: "目录要已经存在。",
					value: T("pikpak"),
					isDisabled: !e.available,
					onChange: (e) => E("pikpak", e)
				}), /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, $.jsx)(ne, { children: /* @__PURE__ */ (0, $.jsx)(z, {
						source: "pikpak",
						label: "PikPak 根目录对应的媒体目录"
					}) }), e.pikpak_roots.length ? /* @__PURE__ */ (0, $.jsx)(I, {
						"aria-label": "PikPak 根目录对应的媒体目录",
						selectedKey: i.pikpak_root || null,
						isDisabled: !e.available,
						placeholder: "检查时根据媒体库目录选择",
						onSelectionChange: (e) => a({
							...i,
							pikpak_root: e === null ? "" : String(e)
						}),
						children: e.pikpak_roots.map((e) => /* @__PURE__ */ (0, $.jsx)(L, {
							id: e,
							children: e
						}, e))
					}) : /* @__PURE__ */ (0, $.jsx)(j, { children: "先在「媒体库与入库」添加 PikPak 挂载文件夹。" })]
				})] }) : null,
				/* @__PURE__ */ (0, $.jsx)(M, {
					label: "等待上限（小时）",
					type: "number",
					inputMode: "numeric",
					autoComplete: "off",
					hint: `超时标为停滞；可填 1–${e.max_wait_hours} 小时。`,
					value: c,
					isDisabled: !e.available,
					onChange: l
				})
			] }),
			x.busy === "auto" ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(ce, { label: "正在检查 CloudDrive2" })
			}) : null,
			u ? /* @__PURE__ */ (0, $.jsx)(en, {
				report: u,
				detected: p,
				suggested: h,
				create: e.available ? (e) => {
					let t = {
						clouddrive_address: i.clouddrive_address,
						token: o,
						path: e,
						pikpak_root: i.pikpak_root,
						pikpak_account: r
					};
					x.run("folder", (e) => W(Wt, t, "POST", e), (t) => {
						f(t), g((t) => ({
							...t,
							target: {
								path: e,
								exists: !0
							}
						})), b(!1), v(""), n("已新建目录");
					}, (e) => v(K(e)));
				} : void 0,
				creating: x.busy === "folder"
			}) : null,
			_ || x.error ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(C, { children: _ || x.error })
			}) : null,
			/* @__PURE__ */ (0, $.jsxs)(A, {
				status: e.available ? void 0 : "云下载只在允许修改数据库的设备上可用。",
				children: [/* @__PURE__ */ (0, $.jsx)(d, {
					variant: "secondary",
					onClick: () => {
						let e = {
							address: !i.clouddrive_address.trim(),
							target: !T("115").trim(),
							root: !i.pikpak_root
						}, t = {
							clouddrive_address: i.clouddrive_address,
							token: o,
							target: T("115"),
							pikpak_root: i.pikpak_root,
							pikpak_account: r
						};
						x.run("check", (e) => W(Ut, t, "POST", e), (t) => O(t, e), (e) => v(K(e)));
					},
					disabled: !e.available,
					...G(x.busy === "check"),
					children: "检查连接"
				}), /* @__PURE__ */ (0, $.jsx)(d, {
					type: "submit",
					disabled: !e.available,
					...G(x.busy === "save"),
					children: "保存配置"
				})]
			})
		]
	});
}
var $t = {
	target: null,
	root: "",
	saved: !1
};
function en({ report: e, detected: t, suggested: n, create: r, creating: i }) {
	let a = n.target, o = !!(t || a || n.root || e.permissions.length || e.folder || e.quota);
	return !o && !e.problems.length ? null : /* @__PURE__ */ (0, $.jsxs)(B, {
		divided: !0,
		children: [o ? /* @__PURE__ */ (0, $.jsxs)(te, { children: [
			t ? /* @__PURE__ */ (0, $.jsx)(k, {
				term: "CloudDrive2 地址",
				children: `探测到 ${t}，保存配置后生效`
			}) : null,
			a?.exists ? /* @__PURE__ */ (0, $.jsx)(k, {
				term: /* @__PURE__ */ (0, $.jsx)(z, {
					source: "115",
					label: "115 目标目录"
				}),
				children: n.saved ? `已根据媒体库目录填入 ${a.path}` : `根据媒体库目录填入 ${a.path}，保存配置后生效`
			}) : null,
			a && !a.exists ? /* @__PURE__ */ (0, $.jsxs)(k, {
				term: /* @__PURE__ */ (0, $.jsx)(z, {
					source: "115",
					label: "115 目标目录"
				}),
				children: [`${a.path} 不存在`, r ? /* @__PURE__ */ (0, $.jsx)(d, {
					variant: "secondary",
					size: "small",
					onClick: () => r(a.path),
					...G(i),
					children: "新建这个目录"
				}) : null]
			}) : null,
			n.root ? /* @__PURE__ */ (0, $.jsx)(k, {
				term: /* @__PURE__ */ (0, $.jsx)(z, {
					source: "pikpak",
					label: "PikPak 根目录"
				}),
				children: `根据媒体库目录填入 ${n.root}，保存配置后生效`
			}) : null,
			e.permissions.length ? /* @__PURE__ */ (0, $.jsx)(k, {
				term: "离线权限",
				children: e.missing.length ? e.missing.map((e) => /* @__PURE__ */ (0, $.jsx)(y, {
					variant: "caption",
					color: "yellow",
					children: `缺 ${e}`
				}, e)) : /* @__PURE__ */ (0, $.jsx)(y, {
					variant: "caption",
					color: "lime",
					children: "齐全"
				})
			}) : null,
			e.folder ? /* @__PURE__ */ (0, $.jsx)(k, {
				term: "目标目录",
				children: e.folder.can_offline ? `${e.folder.path} 可以离线下载` : `${e.folder.path} 不支持离线下载`
			}) : null,
			e.quota ? /* @__PURE__ */ (0, $.jsx)(k, {
				term: /* @__PURE__ */ (0, $.jsx)(z, {
					source: "115",
					label: "115 离线配额"
				}),
				children: `本月还剩 ${e.quota.left} 条，共 ${e.quota.total} 条`
			}) : null
		] }) : null, e.problems.map((e) => /* @__PURE__ */ (0, $.jsx)(C, { children: e }, e))]
	});
}
function tn({ state: e, settle: t, receipt: n, username: r, setUsername: i }) {
	let [a, o] = (0, Z.useState)(""), [s, c] = (0, Z.useState)(!1), [l, u] = (0, Z.useState)(""), [f, p] = (0, Z.useState)(""), [m, h] = (0, Z.useState)(""), g = Y(), _ = e.pikpak, y = e.pikpak_browser, b = y.state === "waiting";
	(0, Z.useEffect)(() => {
		if (!b) return;
		let e = new AbortController(), r, i = async () => {
			try {
				let r = await U(qt, e.signal);
				if (e.signal.aborted || (t(r), r.pikpak_browser.state === "done" ? n("已登录 PikPak") : r.pikpak_browser.state !== "waiting" && h(r.pikpak_browser.message), r.pikpak_browser.state !== "waiting")) return;
			} catch (t) {
				if (e.signal.aborted) return;
				p(K(t));
			}
			r = setTimeout(i, Jt);
		};
		return r = setTimeout(i, Jt), () => {
			e.abort(), clearTimeout(r);
		};
	}, [b]);
	let x = () => {
		h(""), g.run("browser", (e) => W(qt, {}, "POST", e), (e) => {
			t(e), p("");
		}, (e) => p(K(e)));
	}, S = () => {
		g.run("cancel", (e) => W(`${qt}/cancel`, {}, "POST", e), (e) => {
			t(e), p(""), h(e.pikpak_browser.message);
		}, (e) => p(K(e)));
	}, ee = (e) => {
		if (e.preventDefault(), _.logged_in) return;
		let i = {
			username: r,
			password: a,
			remember: s
		};
		g.run("login", (e) => W(Gt, i, "POST", e), (e) => {
			t(e.settings), p(""), e.ok ? (u(""), o(""), n("已登录 PikPak")) : u(e.captcha_url ?? "");
		}, (e) => p(K(e)));
	}, T = () => {
		g.run("logout", (e) => W(Kt, {}, "POST", e), (e) => {
			t(e), p(""), n("已登出 PikPak");
		}, (e) => p(K(e)));
	}, E = /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsx)(M, {
			label: "账号",
			placeholder: "邮箱或手机号",
			autoComplete: "username",
			maxLength: 200,
			value: r,
			isDisabled: !e.available,
			onChange: i
		}),
		/* @__PURE__ */ (0, $.jsx)(M, {
			label: "密码",
			type: "password",
			autoComplete: "current-password",
			maxLength: 200,
			value: a,
			isDisabled: !e.available,
			onChange: o
		}),
		/* @__PURE__ */ (0, $.jsx)(v, {
			isSelected: s,
			isDisabled: !e.available,
			onChange: c,
			children: "保存密码，登录过期时自动重新登录"
		}),
		l ? /* @__PURE__ */ (0, $.jsx)(N, {
			tone: "warning",
			title: "需要人机验证",
			extra: /* @__PURE__ */ (0, $.jsx)("div", {
				className: "pt-2",
				children: /* @__PURE__ */ (0, $.jsx)(w, {
					href: l,
					children: "打开 PikPak 验证页"
				})
			}),
			children: "在浏览器里完成验证后，回到这里再点一次「登录」。"
		}) : null
	] }), D = /* @__PURE__ */ (0, $.jsx)(d, {
		type: "submit",
		variant: "primary",
		disabled: !e.available || b,
		...G(g.busy === "login"),
		children: "登录"
	}), O = y.state === "timeout" || y.state === "failed";
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "PikPak 账号",
		icon: /* @__PURE__ */ (0, $.jsx)(Yt, {}),
		onSubmit: ee,
		aside: /* @__PURE__ */ (0, $.jsx)(V, {
			tone: _.logged_in ? "success" : b ? "progress" : O ? "error" : "neutral",
			children: _.logged_in ? "已登录" : b ? "等待登录" : O ? "登录未完成" : "待登录"
		}),
		children: [
			_.logged_in ? /* @__PURE__ */ (0, $.jsxs)(te, { children: [/* @__PURE__ */ (0, $.jsx)(k, {
				term: "账号",
				children: _.username || "已登录"
			}), _.method === "browser" ? /* @__PURE__ */ (0, $.jsx)(k, {
				term: "登录方式",
				children: "浏览器登录，由 Peach 续期"
			}) : /* @__PURE__ */ (0, $.jsx)(k, {
				term: "密码",
				children: _.remember ? "已保存，登录过期时自动重新登录" : "未保存，登录过期后需要回到这里重新登录"
			})] }) : /* @__PURE__ */ (0, $.jsxs)(B, { children: [m ? O ? /* @__PURE__ */ (0, $.jsx)(C, { children: m }) : /* @__PURE__ */ (0, $.jsx)(j, {
				role: "status",
				children: m
			}) : null, E] }),
			f || g.error ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(C, { children: f || g.error })
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(A, {
				status: !_.logged_in && b ? /* @__PURE__ */ (0, $.jsx)(ce, { label: y.message || "等你在浏览器窗口里登录 PikPak" }) : null,
				children: _.logged_in ? /* @__PURE__ */ (0, $.jsx)(d, {
					variant: "secondary",
					onClick: T,
					disabled: !e.available,
					...G(g.busy === "logout"),
					children: "登出"
				}) : /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [y.available ? b ? /* @__PURE__ */ (0, $.jsx)(d, {
					variant: "secondary",
					type: "button",
					onClick: S,
					...G(g.busy === "cancel"),
					children: "取消"
				}) : /* @__PURE__ */ (0, $.jsx)(d, {
					variant: "secondary",
					type: "button",
					onClick: x,
					disabled: !e.available,
					...G(g.busy === "browser"),
					children: "用浏览器登录"
				}) : null, D] })
			})
		]
	});
}
// src/react/settings/library-sharing-settings.tsx
function nn({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)(null), [o, s] = (0, Z.useState)(!1), [c, l] = (0, Z.useState)(!1), u = (0, Z.useMemo)(() => i ? JSON.stringify(i.data, null, 2) : "", [i]), f = Y(), p = (e) => void f.run("save", (t) => W("/api/configuration/library-sharing", {
		enabled: e,
		schema: n.schema,
		consent: c,
		preview_token: i?.token
	}, "POST", t), (e) => {
		r(e), a(null), l(!1), s(!1), t("已保存馆藏与口味上传选项");
	}), m = () => {
		let e = URL.createObjectURL(new Blob([u], { type: "application/json" })), t = document.createElement("a");
		t.href = e, t.download = "peach-library-taste-preview.json", document.body.append(t);
		try {
			t.click();
		} finally {
			t.remove(), setTimeout(() => URL.revokeObjectURL(e), 1e3);
		}
	};
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
			label: "上传馆藏与口味明细",
			description: n.notice,
			children: /* @__PURE__ */ (0, $.jsx)(H, {
				"aria-label": "上传馆藏与口味明细",
				isSelected: n.enabled,
				onChange: (e) => e ? s(!0) : p(!1),
				...G(f.busy === "save")
			})
		}) }),
		n.available ? null : /* @__PURE__ */ (0, $.jsx)(B, {
			divided: !0,
			children: /* @__PURE__ */ (0, $.jsx)("span", {
				className: "self-start",
				children: /* @__PURE__ */ (0, $.jsx)(V, { children: "上传服务未配置" })
			})
		}),
		n.enabled && n.last_attempt?.status === "failed" ? /* @__PURE__ */ (0, $.jsxs)(B, {
			divided: !0,
			children: [/* @__PURE__ */ (0, $.jsx)("span", {
				className: "self-start",
				children: /* @__PURE__ */ (0, $.jsx)(V, {
					tone: n.last_attempt.attempted ? "error" : "warning",
					children: n.last_attempt.attempted ? "上传失败" : "待重新准备"
				})
			}), /* @__PURE__ */ (0, $.jsx)(C, { children: n.last_attempt.attempted ? "馆藏与口味上传失败，本周不再发送。" : "馆藏与口味上传未完成，将自动重新准备。" })]
		}) : null,
		n.enabled && n.last_attempt?.status === "waiting-data" ? /* @__PURE__ */ (0, $.jsxs)(B, {
			divided: !0,
			children: [/* @__PURE__ */ (0, $.jsx)("span", {
				className: "self-start",
				children: /* @__PURE__ */ (0, $.jsx)(V, { children: "等待数据" })
			}), /* @__PURE__ */ (0, $.jsx)(j, { children: "等待可分析的馆藏或偏好数据。" })]
		}) : null,
		n.enabled && n.last_attempt?.status === "unknown" ? /* @__PURE__ */ (0, $.jsxs)(B, {
			divided: !0,
			children: [/* @__PURE__ */ (0, $.jsx)("span", {
				className: "self-start",
				children: /* @__PURE__ */ (0, $.jsx)(V, {
					tone: "warning",
					children: "结果未取得"
				})
			}), /* @__PURE__ */ (0, $.jsx)(j, { children: "未取得上传结果，本周不再发送。" })]
		}) : null,
		i ? /* @__PURE__ */ (0, $.jsxs)(B, {
			divided: !0,
			children: [
				/* @__PURE__ */ (0, $.jsxs)(j, { children: [
					"当前预览包含 ",
					i.data.library.length,
					" 部有编号作品、",
					i.data.coverage.uncoded_items,
					" 条无编号馆藏的汇总，约 ",
					(i.bytes / 1024).toFixed(1),
					" KiB。不含账号、设备、文件路径和浏览器历史记录等个人数据。"
				] }),
				/* @__PURE__ */ (0, $.jsx)(b, {
					summary: "上传数据预览",
					defaultOpen: !0,
					children: /* @__PURE__ */ (0, $.jsx)(St, {
						code: u,
						language: "json",
						label: "馆藏与口味上传预览",
						maxCharacters: 24e3
					})
				}),
				u.length > 24e3 ? /* @__PURE__ */ (0, $.jsx)(j, { children: "显示前 24,000 个字符，下载可查看完整内容。" }) : null,
				/* @__PURE__ */ (0, $.jsx)(d, {
					variant: "secondary",
					onClick: m,
					children: "下载完整预览"
				}),
				n.enabled ? null : /* @__PURE__ */ (0, $.jsx)(v, {
					isSelected: c,
					onChange: l,
					children: "我已查看上传预览，同意上传馆藏与口味明细"
				})
			]
		}) : null,
		f.error ? /* @__PURE__ */ (0, $.jsx)(B, {
			divided: !0,
			children: /* @__PURE__ */ (0, $.jsx)(C, { children: f.error })
		}) : null,
		/* @__PURE__ */ (0, $.jsxs)(A, { children: [
			o && !n.enabled ? /* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				onClick: () => {
					s(!1), a(null), l(!1);
				},
				children: "取消"
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				onClick: () => {
					s(!0), f.run("preview", (e) => U("/api/configuration/library-sharing/preview", e), (e) => {
						a(e), l(!1);
					});
				},
				...G(f.busy === "preview"),
				children: "预览上传内容"
			}),
			!n.enabled && i ? /* @__PURE__ */ (0, $.jsx)(d, {
				variant: "primary",
				disabled: !c,
				onClick: () => p(!0),
				...G(f.busy === "save"),
				children: "同意并开启上传"
			}) : null
		] })
	] });
}
// src/react/settings/remote-reporting-settings.tsx
function rn({ value: e, onChange: t, busy: n = !1 }) {
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
		label: "发送版本统计与错误诊断（推荐）",
		description: "上传版本、系统信息、故障类型、代码位置与发生次数。",
		children: /* @__PURE__ */ (0, $.jsx)(H, {
			"aria-label": "发送版本统计与错误诊断（推荐）",
			isSelected: e.usage && e.errors,
			onChange: (n) => t({
				...e,
				usage: n,
				errors: n
			}),
			...G(n)
		})
	}) }), e.available ? null : /* @__PURE__ */ (0, $.jsx)(B, {
		divided: !0,
		children: /* @__PURE__ */ (0, $.jsx)("span", {
			className: "self-start",
			children: /* @__PURE__ */ (0, $.jsx)(V, { children: "上传服务未配置" })
		})
	})] });
}
function an({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), i = Y();
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(rn, {
		value: n,
		busy: i.busy === "save",
		onChange: (e) => {
			i.run("save", (t) => W("/api/configuration/remote-reporting", {
				usage: e.usage,
				errors: e.errors
			}, "POST", t), (e) => {
				r(e), t("已保存诊断选项");
			});
		}
	}), i.error ? /* @__PURE__ */ (0, $.jsx)(B, {
		divided: !0,
		children: /* @__PURE__ */ (0, $.jsx)(C, { children: i.error })
	}) : null] });
}
// src/react/settings/storage-settings.tsx
var on = "/api/configuration/storage", sn = 1500, cn = 864e5, ln = (e) => e instanceof u && e.body?.errors?.target || K(e);
function un(e) {
	if (e.free_bytes === null || e.total_bytes === null) return "未取得";
	let t = `${Qe(e.free_bytes)} 可用，共 ${Qe(e.total_bytes)}`;
	return e.system_drive ? `${t}（系统盘）` : t;
}
function dn({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)(""), o = Y(), s = n.job.state !== "idle", c = (0, Z.useRef)(s);
	(0, Z.useEffect)(() => {
		if (!s) return;
		let e = new AbortController(), t = setTimeout(() => {
			U(on, e.signal).then(r, () => {
				e.signal.aborted || r((e) => ({ ...e }));
			});
		}, sn);
		return () => {
			e.abort(), clearTimeout(t);
		};
	}, [n]), (0, Z.useEffect)(() => {
		s ? c.current = !0 : c.current && (c.current = !1, n.job.error || t(n.job.message || "已统计占用空间"));
	}, [s]);
	let l = () => void o.run("measure", (e) => W(`${on}/measure`, {}, "POST", e), r), u = (e) => void Ve({
		title: `清理${e.label}`,
		body: `将删除 ${Qe(e.reclaimable)} 的${e.label}，${e.description}。`,
		confirmLabel: `清理${e.label}`,
		danger: e.key === "backups",
		onConfirm: async () => r(await W(`${on}/clean`, { category: e.key }))
	}), f = () => void o.run("relocate", async (e) => {
		let t = (await W(me, { initial: n.data_root }, "POST", e)).path;
		if (!t) return;
		let r = n.usage ? Qe(n.usage.total_bytes) : "";
		await Ve({
			title: "迁移数据目录",
			body: `将 ${r} 数据从 ${n.data_root} 移到 ${t}。迁移期间 Peach 会退出，完成后自动重新打开；原位置的数据在新位置核对无误后删除。`,
			confirmLabel: "迁移数据目录",
			onConfirm: async () => {
				try {
					a((await W(`${on}/relocate`, { target: t })).message);
				} catch (e) {
					throw Error(ln(e));
				}
			}
		});
	}, () => void 0), p = n.usage, m = n.relocation.last, h = m && (m.state === "error" || (m.notes?.length ?? 0) > 0 || Date.now() - m.finished_at * 1e3 < cn), g = i || (n.job.state === "measuring" ? "正在统计占用空间…" : n.job.state === "cleaning" ? "正在清理…" : p ? `共 ${Qe(p.total_bytes)}，${p.total_files.toLocaleString()} 个文件` : ""), _ = s || !!i;
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "storageSettings",
		title: "存储空间",
		children: [
			/* @__PURE__ */ (0, $.jsxs)(te, { children: [/* @__PURE__ */ (0, $.jsx)(k, {
				term: "数据目录",
				children: /* @__PURE__ */ (0, $.jsx)(ye, {
					path: n.data_root,
					className: "text-body-regular text-text-primary",
					onRevealed: t
				})
			}), /* @__PURE__ */ (0, $.jsx)(k, {
				term: "所在磁盘",
				children: un(n)
			})] }),
			p ? /* @__PURE__ */ (0, $.jsx)(P, { children: p.categories.map((e) => /* @__PURE__ */ (0, $.jsx)(R, {
				label: e.label,
				description: e.cleanable && e.description ? e.description : void 0,
				children: /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex shrink-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, $.jsx)("span", {
						className: "text-body-regular text-text-secondary tabular-nums",
						children: Qe(e.bytes)
					}), e.cleanable && e.reclaimable > 0 ? (() => {
						let t = n.job.state === "cleaning" && n.job.category === e.key;
						return /* @__PURE__ */ (0, $.jsxs)(d, {
							variant: "secondary",
							disabled: _ && !t,
							...G(t),
							onClick: () => u(e),
							children: ["清理 ", Qe(e.reclaimable)]
						});
					})() : null]
				})
			}, e.key)) }) : /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(j, { children: "统计后显示各类数据的占用，并可清理缓存与旧备份。" })
			}),
			!n.relocation.available || n.job.error || o.error || h ? /* @__PURE__ */ (0, $.jsxs)(B, {
				divided: !0,
				children: [
					n.relocation.available ? null : /* @__PURE__ */ (0, $.jsx)(j, { children: n.relocation.message }),
					n.job.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: n.job.message }) : null,
					o.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: o.error }) : null,
					h && m ? m.state === "error" ? /* @__PURE__ */ (0, $.jsx)(C, { children: m.message }) : /* @__PURE__ */ (0, $.jsx)(j, { children: [m.message, ...m.notes ?? []].join("；") }) : null
				]
			}) : null,
			/* @__PURE__ */ (0, $.jsxs)(A, {
				status: g ? /* @__PURE__ */ (0, $.jsx)("p", {
					role: i ? "status" : void 0,
					children: g
				}) : null,
				children: [/* @__PURE__ */ (0, $.jsx)(d, {
					variant: "secondary",
					disabled: _ || !n.relocation.available || !p,
					onClick: f,
					...G(o.busy === "relocate"),
					children: "更改位置"
				}), /* @__PURE__ */ (0, $.jsx)(d, {
					disabled: !!i || n.job.state === "cleaning",
					onClick: l,
					...G(o.busy === "measure" || n.job.state === "measuring"),
					children: p ? "重新统计" : "统计占用"
				})]
			})
		]
	});
}
// src/react/settings/maintenance-settings.tsx
var fn = [
	["6", "每 6 小时"],
	["24", "每天"],
	["168", "每周"]
];
function pn({ data: e, receipt: t, reopenTutorial: n, panel: r }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		...Q(r),
		children: [
			e.storage ? /* @__PURE__ */ (0, $.jsx)(dn, {
				initial: e.storage,
				receipt: t
			}) : null,
			e.remote_reporting || e.library_sharing ? /* @__PURE__ */ (0, $.jsxs)(F, {
				id: "librarySharing",
				title: "数据上传",
				children: [e.remote_reporting ? /* @__PURE__ */ (0, $.jsx)(an, {
					initial: e.remote_reporting,
					receipt: t
				}) : null, e.library_sharing ? /* @__PURE__ */ (0, $.jsx)("div", {
					className: "border-t border-separator-border",
					children: /* @__PURE__ */ (0, $.jsx)(nn, {
						initial: e.library_sharing,
						receipt: t
					})
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(gn, { facts: e.facts }),
			/* @__PURE__ */ (0, $.jsx)(mn, {
				receipt: t,
				reopenTutorial: n
			}),
			e.uninstall ? /* @__PURE__ */ (0, $.jsx)(_n, {
				uninstall: e.uninstall,
				receipt: t
			}) : null
		]
	});
}
function mn({ receipt: e, reopenTutorial: t }) {
	let n = Y();
	return /* @__PURE__ */ (0, $.jsx)("section", {
		"aria-label": "安装教程",
		className: "w-full",
		children: /* @__PURE__ */ (0, $.jsxs)(ke, { children: [/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
			label: "安装教程",
			children: /* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				onClick: () => void n.run("reopen", () => t(), () => e("已重新打开安装教程")),
				...G(n.busy === "reopen"),
				children: "重新打开教程"
			})
		}) }), n.error ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(C, { children: n.error }) }) : null] })
	});
}
function hn({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e.mode), [i, a] = (0, Z.useState)(e.interval_hours), o = Y(e.error), s = (r) => {
		r.preventDefault(), e.available && o.run("save", (e) => W("/api/configuration/automatic-updates", {
			mode: n,
			interval_hours: i
		}, "POST", e), () => t("已保存配置"));
	}, c = e.available ? e.download_available ? "下载完成后在这里确认重启安装。" : void 0 : "自动更新需要由托盘管理的服务。";
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "automaticUpdates",
		title: "自动更新",
		onSubmit: s,
		children: [
			/* @__PURE__ */ (0, $.jsxs)(P, { children: [
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "自动检查新版本",
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "自动检查新版本",
						isSelected: n !== "off",
						isDisabled: !e.available,
						onChange: (e) => r(e ? "check" : "off")
					})
				}),
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "自动下载更新",
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "自动下载更新",
						isSelected: n === "download",
						isDisabled: !e.available || !e.download_available || n === "off",
						onChange: (e) => r(e ? "download" : "check")
					})
				}),
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "检查频率",
					description: c,
					children: /* @__PURE__ */ (0, $.jsx)(I, {
						"aria-label": "检查频率",
						selectedKey: String(i),
						isDisabled: !e.available,
						onSelectionChange: (e) => {
							e !== null && a(Number(e));
						},
						children: fn.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(L, {
							id: e,
							children: t
						}, e))
					})
				})
			] }),
			o.error ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(C, { children: o.error })
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
				type: "submit",
				disabled: !e.available,
				...G(o.busy === "save"),
				children: "保存配置"
			}) })
		]
	});
}
function gn({ facts: e }) {
	return /* @__PURE__ */ (0, $.jsx)(F, {
		title: "运行信息",
		children: /* @__PURE__ */ (0, $.jsx)(te, { children: e.map((e) => /* @__PURE__ */ (0, $.jsxs)(k, {
			term: e.term,
			children: [e.value, e.download_url ? /* @__PURE__ */ (0, $.jsx)(w, {
				href: e.download_url,
				children: e.download_label
			}) : null]
		}, e.term)) })
	});
}
function _n({ uninstall: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(!1), [i, a] = (0, Z.useState)(""), o = () => void Ve({
		title: "卸载 Peach",
		danger: !0,
		body: n ? "将退出 Peach，移除程序、开机自启、桌面图标、设置、本地数据库、观看记录、凭据和缓存。原始媒体文件保留。" : "将退出 Peach 并移除程序、开机自启和桌面图标。设置、本地数据库、观看记录与缓存保留。",
		confirmLabel: "卸载 Peach",
		onConfirm: async () => {
			let e = await W("/api/configuration/uninstall", {
				delete_data: n,
				confirmation: "卸载 Peach"
			});
			a(e.message);
		}
	}), s = i || e.message, c = [.../* @__PURE__ */ new Set([e.data_root, ...e.directories])];
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "uninstallPeach",
		title: "卸载 Peach",
		children: [
			e.available ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(j, { children: "卸载移除 Peach 程序本身，原始媒体文件保留。" }) }) : null,
			/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
				label: "完全卸载",
				description: "同时删除设置、本地数据库、观看记录、凭据和缓存",
				children: /* @__PURE__ */ (0, $.jsx)(H, {
					"aria-label": "完全卸载",
					isSelected: n,
					isDisabled: !e.full_available || !!i,
					onChange: r
				})
			}) }),
			/* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(b, {
					summary: "数据目录",
					children: c.map((e) => /* @__PURE__ */ (0, $.jsx)(ye, {
						path: e,
						className: "text-body-2-regular text-text-secondary",
						onRevealed: t
					}, e))
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(A, {
				status: s ? /* @__PURE__ */ (0, $.jsx)("p", {
					role: i ? "status" : void 0,
					children: s
				}) : null,
				children: /* @__PURE__ */ (0, $.jsx)(d, {
					variant: "danger",
					disabled: !e.available || !!i,
					onClick: o,
					children: "卸载 Peach"
				})
			})
		]
	});
}
// src/react/settings/release-updates.tsx
var vn = /* @__PURE__ */ new Set([
	"downloading",
	"verifying",
	"extracting",
	"preparing",
	"restarting",
	"installing"
]), yn = [
	65,
	75,
	90
], bn = 120;
function xn({ initial: e, initialJob: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)(t || {
		state: "idle",
		progress: 0
	}), [o, s] = (0, Z.useState)(""), c = Y(), l = (0, Z.useRef)(!1), u = (0, Z.useRef)(!0), f = vn.has(i.state);
	(0, Z.useEffect)(() => (u.current = !0, () => {
		u.current = !1;
	}), []);
	let p = async () => {
		let e = await W("/api/configuration/update-restart", {});
		u.current && a(e);
	}, m = () => void Ve({
		title: "更新已准备好",
		body: `Peach ${i.version || ""} 将在重启后安装。`,
		confirmLabel: "立即重启",
		cancelLabel: "稍后",
		onConfirm: p
	});
	(0, Z.useEffect)(() => {
		i.state !== "ready" || l.current || (l.current = !0, m());
	}, [i.state]), (0, Z.useEffect)(() => {
		let e = new AbortController(), t = vn.has(i.state) ? 1e3 : 3e4, n, o = 0, c = async () => {
			try {
				let t = await U("/api/configuration/update-status", e.signal);
				if (e.signal.aborted) return;
				a(t), o = 0, t.state === "complete" && r((e) => ({
					...e,
					current_version: t.version || e.current_version,
					state: "current",
					message: "已是最新测试版。"
				}));
				let n = await U("/api/configuration/automatic-updates", e.signal);
				!e.signal.aborted && n.result && r(n.result);
			} catch {
				o += 1, o >= bn && !e.signal.aborted && s("尚未连接到 Peach，请检查托盘后刷新页面。");
			}
			!e.signal.aborted && o < bn && (n = setTimeout(c, t));
		};
		return n = setTimeout(c, t), () => {
			e.abort(), clearTimeout(n);
		};
	}, [i.state]);
	let h = () => {
		f || (l.current = !1, s(""), c.run("download", (e) => W("/api/configuration/update", {}, "POST", e), a));
	}, g = () => void c.run("check", (e) => U("/api/configuration/updates", e), r, (t) => {
		r({
			...e,
			state: "error"
		}), c.setError(K(t));
	}), _ = c.error || o, v = i.state === "downloading" && i.total ? `${((i.downloaded || 0) / 1048576).toFixed(1)} / ${(i.total / 1048576).toFixed(1)} MB` : `${i.progress}%`;
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "releaseUpdates",
		title: "检查更新",
		aside: /* @__PURE__ */ (0, $.jsx)(V, {
			tone: _ || n.state === "error" || i.state === "error" ? "error" : f ? "progress" : n.state === "available" ? "warning" : n.state === "unchecked" ? "neutral" : "success",
			children: _ || n.state === "error" || i.state === "error" ? "检查未完成" : f ? "准备更新中" : i.state === "ready" ? "可安装" : n.state === "available" ? "有可用更新" : n.state === "unchecked" ? "尚未检查" : "检查完成"
		}),
		children: [
			/* @__PURE__ */ (0, $.jsxs)(te, { children: [
				/* @__PURE__ */ (0, $.jsx)(k, {
					term: "当前版本",
					children: n.current_version
				}),
				/* @__PURE__ */ (0, $.jsx)(k, {
					term: "安装方式",
					children: n.installation
				}),
				/* @__PURE__ */ (0, $.jsx)(k, {
					term: "更新通道",
					children: n.channel
				}),
				/* @__PURE__ */ (0, $.jsx)(k, {
					term: "最新版本",
					children: n.latest_version || "未取得"
				}),
				n.package_kind ? /* @__PURE__ */ (0, $.jsxs)(k, {
					term: "下载内容",
					children: [n.package_kind === "update" ? "应用更新包" : "应用与工具", n.asset_size ? ` · ${(n.asset_size / 1048576).toFixed(1)} MB` : ""]
				}) : null
			] }),
			n.package_kind === "update" ? /* @__PURE__ */ (0, $.jsx)(j, { children: "应用更新包复用已安装工具；工具缺失、损坏或版本变化时会另行下载所需工具包。" }) : n.package_kind === "full" ? /* @__PURE__ */ (0, $.jsx)(j, { children: "本次更新包含媒体工具。" }) : null,
			n.state === "unchecked" && !n.checked_at && !_ && i.state === "idle" ? null : /* @__PURE__ */ (0, $.jsxs)(B, {
				divided: !0,
				children: [
					n.checked_at ? /* @__PURE__ */ (0, $.jsxs)(j, { children: ["检查于 ", (/* @__PURE__ */ new Date(n.checked_at * 1e3)).toLocaleString()] }) : null,
					n.state === "available" && !_ ? /* @__PURE__ */ (0, $.jsx)(N, {
						tone: "info",
						title: "有可用更新",
						children: n.message
					}) : _ || n.state === "error" ? /* @__PURE__ */ (0, $.jsx)(C, { children: _ || n.message }) : n.state === "unchecked" ? null : /* @__PURE__ */ (0, $.jsx)(j, {
						role: "status",
						children: n.message
					}),
					i.state === "error" ? /* @__PURE__ */ (0, $.jsx)(C, { children: i.message }) : null,
					i.state !== "idle" && i.state !== "error" ? /* @__PURE__ */ (0, $.jsxs)("div", {
						"aria-live": "polite",
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, $.jsx)(xe, {
								label: "更新准备进度",
								value: i.progress,
								stops: yn
							}),
							/* @__PURE__ */ (0, $.jsxs)(j, { children: ["下载 → 校验 → 解压 → 准备安装 · ", i.message] }),
							/* @__PURE__ */ (0, $.jsx)(j, { children: v })
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, $.jsxs)(A, {
				status: /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, $.jsx)(w, {
							href: "https://peach.video/#download",
							children: "官网"
						}),
						/* @__PURE__ */ (0, $.jsxs)("span", {
							className: "inline-flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, $.jsx)(w, {
								href: "https://github.com/peach-mitao/peach",
								children: "GitHub"
							}), /* @__PURE__ */ (0, $.jsx)(V, { children: "暂无法更新" })]
						}),
						/* @__PURE__ */ (0, $.jsx)(w, {
							href: "https://gitgud.io/peach-mitao/peach/-/releases",
							children: "查看发布页"
						})
					]
				}),
				children: [
					/* @__PURE__ */ (0, $.jsx)(d, {
						variant: i.state === "ready" || n.state === "available" && n.installation === "独立测试包" ? "secondary" : "primary",
						disabled: f,
						onClick: g,
						...G(c.busy === "check"),
						children: "检查更新"
					}),
					n.state === "available" && n.installation === "独立测试包" && i.state !== "ready" ? /* @__PURE__ */ (0, $.jsx)(d, {
						variant: "primary",
						onClick: h,
						...G(f || c.busy === "download"),
						children: "下载并安装"
					}) : null,
					i.state === "ready" ? /* @__PURE__ */ (0, $.jsx)(d, {
						variant: "primary",
						onClick: m,
						children: "重启安装"
					}) : null
				]
			})
		]
	});
}
// src/react/settings/upgrade-repairs.tsx
var Sn = {
	pending: "等待修复",
	running: "正在修复",
	failed: "需要重试",
	review: "需要复核",
	complete: "已完成",
	unavailable: "当前部署未启用"
};
function Cn() {
	let { snapshot: e } = ht(), [t, n] = (0, Z.useState)(null), r = Y();
	(0, Z.useEffect)(() => n(null), [e]);
	let i = t ?? e?.repairs, a = i?.state || "pending", o = i?.items.reduce((e, t) => e + (t.pending || 0), 0) || 0, s = i?.items.reduce((e, t) => e + (t.failed || 0), 0) || 0, c = i?.items.reduce((e, t) => e + (t.review_count || 0), 0) || 0;
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "upgradeRepairs",
		title: "自动修复",
		aside: /* @__PURE__ */ (0, $.jsx)(V, {
			tone: a === "failed" ? "error" : a === "running" ? "progress" : a === "review" ? "warning" : a === "complete" ? "success" : "neutral",
			children: /* @__PURE__ */ (0, $.jsx)("span", {
				"data-copy-key": `upgradeRepairs.${a}.status`,
				children: Sn[a] || "未取得"
			}, a)
		}),
		children: [
			/* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(j, { children: "升级后自动修正资料、更新缓存。" }) }),
			/* @__PURE__ */ (0, $.jsxs)(te, { children: [
				/* @__PURE__ */ (0, $.jsxs)(k, {
					term: "待完成",
					children: [o, " 项"]
				}),
				/* @__PURE__ */ (0, $.jsxs)(k, {
					term: "失败",
					children: [s, " 项"]
				}),
				/* @__PURE__ */ (0, $.jsxs)(k, {
					term: "待复核",
					children: [c, " 项"]
				})
			] }),
			i?.message || r.error ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(C, { children: r.error || i?.message }) }) : null,
			a === "running" ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(j, { children: "资料与预览正在后台补全，可在活动页查看进度。" }) }) : null,
			/* @__PURE__ */ (0, $.jsx)(A, {
				status: c ? /* @__PURE__ */ (0, $.jsx)(w, {
					href: "/api/configuration/upgrade-repairs/review",
					children: "下载复核记录"
				}) : void 0,
				children: /* @__PURE__ */ (0, $.jsx)(d, {
					size: "small",
					variant: "secondary",
					disabled: !i?.available || a === "running" || !!r.busy || !s && a !== "failed",
					onClick: () => void r.run("retry", (e) => W("/api/configuration/upgrade-repairs/retry", {}, "POST", e), (e) => {
						n(e), document.dispatchEvent(new Event("peach:client-updates"));
					}),
					children: "重试失败项"
				})
			})
		]
	});
}
// src/react/settings/general-settings.tsx
function wn({ data: e, receipt: t, panel: n }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		...Q(n),
		children: [
			e.updates ? /* @__PURE__ */ (0, $.jsx)(xn, {
				initial: e.updates,
				initialJob: e.update_job
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(Cn, {}),
			e.automatic_updates ? /* @__PURE__ */ (0, $.jsx)(hn, {
				initial: e.automatic_updates,
				receipt: t
			}) : null,
			e.startup ? /* @__PURE__ */ (0, $.jsx)(Tn, {
				startup: e.startup,
				receipt: t
			}) : null
		]
	});
}
function Tn({ startup: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e.enabled), [i, a] = (0, Z.useState)(e.silent), [o, s] = (0, Z.useState)(e.desktop), c = Y(), l = e.available && !e.desktop_message;
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "开机自启",
		onSubmit: (r) => {
			r.preventDefault(), e.available && c.run("save", (e) => W("/api/configuration/startup", {
				enabled: n,
				silent: i,
				desktop: o
			}, "POST", e), () => t("已保存配置"));
		},
		children: [
			/* @__PURE__ */ (0, $.jsxs)(P, { children: [
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "开机后启动 Peach",
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "开机后启动 Peach",
						isSelected: n,
						isDisabled: !e.available,
						onChange: r
					})
				}),
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "只启动托盘，不打开网页",
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "只启动托盘，不打开网页",
						isSelected: i,
						isDisabled: !e.available || !n,
						onChange: a
					})
				}),
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "在桌面创建快捷方式",
					description: e.desktop_message || void 0,
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "在桌面创建快捷方式",
						isSelected: o,
						isDisabled: !l,
						onChange: s
					})
				})
			] }),
			e.message || c.error ? /* @__PURE__ */ (0, $.jsxs)(B, {
				divided: !0,
				children: [e.message ? /* @__PURE__ */ (0, $.jsx)(j, { children: e.message }) : null, c.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: c.error }) : null]
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
				type: "submit",
				disabled: !e.available,
				...G(c.busy === "save"),
				children: "保存配置"
			}) })
		]
	});
}
// src/react/restart-redirect.ts
var En = 8e3, Dn = [
	{
		name: "机械硬盘，或内存 8 GB 以内",
		cache: "10–20 GiB",
		read: "256 / 128 KB",
		task: "1 个"
	},
	{
		name: "SATA SSD，内存 8–16 GB",
		cache: "20–50 GiB",
		read: "256 / 128 KB",
		task: "1–2 个"
	},
	{
		name: "NVMe SSD，内存 16 GB 以上",
		cache: "50–100 GiB",
		read: "256 / 128 KB",
		task: "2 个起步"
	}
], On = [
	["cache", "缓存上限"],
	["read", "读取长度（默认 / 最小）"],
	["task", "同时处理视频"]
];
function kn() {
	return /* @__PURE__ */ (0, $.jsx)("div", {
		className: "@container flex flex-col gap-3",
		children: /* @__PURE__ */ (0, $.jsxs)(b, {
			summary: "CloudDrive 设置帮助",
			children: [
				/* @__PURE__ */ (0, $.jsxs)(j, { children: ["先将 CloudDrive2 或 OpenList 中的网盘挂载为本机文件夹，再在这里选择。", /* @__PURE__ */ (0, $.jsx)(w, {
					href: "https://www.clouddrive2.com/help.html",
					children: "挂载帮助"
				})] }),
				/* @__PURE__ */ (0, $.jsx)(j, { children: "缓存按所在硬盘和可用内存选起步值，再根据播放表现调整。" }),
				/* @__PURE__ */ (0, $.jsx)(j, { children: "文件操作需要挂载工具和网盘账号授予写入权限。光鸭云盘的上传、建文件夹、改名和移动需要 CloudDrive2 v1.1.0 或更高版本，删除和复制暂不支持。" }),
				/* @__PURE__ */ (0, $.jsx)("ul", {
					"aria-label": "按缓存所在硬盘分档",
					className: "flex flex-col gap-2",
					children: Dn.map((e) => /* @__PURE__ */ (0, $.jsxs)("li", {
						className: "flex flex-col gap-2 rounded-2lg border border-separator-border bg-background-primary-default p-3",
						children: [/* @__PURE__ */ (0, $.jsx)("p", {
							className: "text-body-medium text-text-primary",
							children: e.name
						}), /* @__PURE__ */ (0, $.jsx)("dl", {
							className: "inline-grid grid-cols-1 gap-2 @md:grid-cols-3",
							children: On.map(([t, n]) => /* @__PURE__ */ (0, $.jsxs)("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ (0, $.jsx)("dt", {
									className: "text-caption-1-regular text-text-secondary",
									children: n
								}), /* @__PURE__ */ (0, $.jsx)("dd", {
									className: "text-body-regular text-text-primary",
									children: e[t]
								})]
							}, t))
						})]
					}, e.name))
				}),
				/* @__PURE__ */ (0, $.jsxs)("ul", {
					className: "flex list-disc flex-col gap-1 pl-5 text-body-2-regular text-text-secondary",
					children: [
						/* @__PURE__ */ (0, $.jsx)("li", { children: "缓存上限和清理方式填在 CloudDrive「设置」里，清理方式选 LRU。上限不要填 0，系统盘至少留 40 GiB；填完重开设置页确认存住了。" }),
						/* @__PURE__ */ (0, $.jsx)("li", { children: "读取长度和下载线程填在每个网盘各自的下载设置里，线程都从 2 开始。" }),
						/* @__PURE__ */ (0, $.jsx)("li", { children: "Buffer Cache 占内存，磁盘缓存和文件夹缓存占硬盘，改一个管不住另外两个。" })
					]
				}),
				/* @__PURE__ */ (0, $.jsx)(j, { children: /* @__PURE__ */ (0, $.jsx)(w, {
					href: "https://github.com/peach-mitao/peach/blob/master/docs/CLOUDDRIVE.md",
					children: "完整配置与调优说明"
				}) })
			]
		})
	});
}
// src/react/settings/cloud-proxy-settings.tsx
var An = "/api/configuration/cloud-proxies", jn = [
	["direct", "直连"],
	["system", "跟随系统"],
	["http", "HTTP 代理"],
	["socks5", "SOCKS5 代理"]
];
function Mn({ receipt: e }) {
	let [t, n] = (0, Z.useState)(null), [r, i] = (0, Z.useState)(!0), a = (0, Z.useRef)(/* @__PURE__ */ new Set()), o = (0, Z.useRef)(/* @__PURE__ */ new Set()), [s, c] = (0, Z.useState)(!1), l = (0, Z.useRef)(() => void 0), u = Y(), f = () => {
		o.current.size || u.run("refresh", (e) => U(An, e), (e) => {
			a.current.clear(), n(e), i(!1);
		}, (e) => {
			i(!1), u.setError(e instanceof Error ? e.message : "无法读取网盘代理");
		});
	};
	return l.current = f, (0, Z.useEffect)(() => {
		l.current();
		let e = () => {
			a.current.size || l.current();
		};
		return window.addEventListener("focus", e), () => window.removeEventListener("focus", e);
	}, []), (0, Z.useEffect)(() => {
		if (!t) return;
		let e = (e) => e.mode === "http" || e.mode === "socks5";
		J("cloudProxy", {
			configured: t.configured !== !1,
			unlinked: t.unlinked?.length ?? 0,
			accounts: t.accounts.map((t) => [e(t.data), e(t.api)])
		});
	}, [t]), r ? /* @__PURE__ */ (0, $.jsx)(Ee, {
		label: "正在读取网盘代理",
		html: ze
	}) : /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "CloudDrive 代理",
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [/* @__PURE__ */ (0, $.jsx)(j, { children: m }), /* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-4",
			children: [
				u.error ? /* @__PURE__ */ (0, $.jsxs)(N, {
					tone: "error",
					title: "没有读取配置",
					children: [
						u.error,
						" ",
						/* @__PURE__ */ (0, $.jsx)(se, {
							href: "/settings/downloads",
							size: "small",
							children: "下载设置"
						})
					]
				}) : null,
				t?.configured === !1 ? /* @__PURE__ */ (0, $.jsxs)(j, { children: ["填写 CloudDrive2 地址和 API 令牌后，在这里设置各网盘账号的代理。 ", /* @__PURE__ */ (0, $.jsx)(se, {
					href: "/settings/downloads",
					size: "small",
					children: "下载设置"
				})] }) : t?.accounts.length === 0 && !t.unlinked?.length ? /* @__PURE__ */ (0, $.jsx)(j, { children: "还没有使用 CloudDrive 的媒体库。" }) : null,
				t?.unlinked?.map((e) => /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-1",
					children: [/* @__PURE__ */ (0, $.jsx)(ne, { children: /* @__PURE__ */ (0, $.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, $.jsx)(je, { mark: jt(e.location) }), e.name]
					}) }), /* @__PURE__ */ (0, $.jsx)(j, { children: "尚未匹配 CloudDrive 账号" })]
				}, e.root)),
				t?.accounts.map((t) => /* @__PURE__ */ (0, $.jsx)(Nn, {
					initial: t,
					receipt: e,
					onDirty: () => a.current.add(t.id),
					onSaving: (e) => {
						e ? o.current.add(t.id) : o.current.delete(t.id), c(!!o.current.size);
					},
					onSaved: (e) => {
						a.current.delete(e.id), n((t) => t && {
							...t,
							accounts: t.accounts.map((t) => t.id === e.id ? e : t)
						});
					}
				}, t.id + t.revision))
			]
		})] }), /* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
			variant: "secondary",
			disabled: s,
			onClick: f,
			...G(u.busy === "refresh"),
			children: "重新读取"
		}) })]
	});
}
function Nn({ initial: e, receipt: t, onDirty: n, onSaved: r, onSaving: i }) {
	let [a, o] = (0, Z.useState)(e), [s, c] = (0, Z.useState)([]), l = a.libraries?.map((e) => e.name).join("、") || a.name, u = Y(), f = (e, t) => {
		o((n) => ({
			...n,
			[e]: t
		})), c((t) => t.includes(e) ? t : [...t, e]), n();
	};
	return /* @__PURE__ */ (0, $.jsxs)("form", {
		"aria-label": `${l} 代理`,
		onSubmit: (e) => {
			e.preventDefault(), i(!0), u.run("save", (e) => W(An, {
				id: a.id,
				revision: a.revision,
				...s.includes("api") ? { api: a.api } : {},
				...s.includes("data") ? { data: a.data } : {}
			}, "POST", e), (e) => {
				o(e), c([]), r(e), t("已保存 CloudDrive 代理");
			}).finally(() => i(!1));
		},
		className: "flex min-w-0 flex-col gap-4 border-t border-separator-border pt-4",
		children: [
			/* @__PURE__ */ (0, $.jsx)(ne, { children: /* @__PURE__ */ (0, $.jsxs)("span", {
				className: "inline-flex items-center gap-2",
				children: [/* @__PURE__ */ (0, $.jsx)(je, { mark: jt(a.libraries?.[0]?.location || (a.cloud === "115open" ? "115" : a.cloud.toLowerCase())) }), l]
			}) }),
			/* @__PURE__ */ (0, $.jsxs)(j, { children: [
				a.name,
				" · ",
				a.path
			] }),
			/* @__PURE__ */ (0, $.jsx)(Pn, {
				label: "数据代理",
				value: a.data,
				disabled: !a.writable || !!u.busy,
				onChange: (e) => f("data", e)
			}),
			/* @__PURE__ */ (0, $.jsx)(Pn, {
				label: "API 代理",
				value: a.api,
				disabled: !a.writable || !!u.busy,
				onChange: (e) => f("api", e)
			}),
			a.writable ? null : /* @__PURE__ */ (0, $.jsx)(j, { children: "API 令牌需要“修改云盘”权限才能保存。" }),
			u.error ? /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "error",
				title: "没有保存",
				children: u.error
			}) : null,
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, $.jsx)(d, {
					type: "submit",
					disabled: !a.writable || !s.length,
					...G(u.busy === "save"),
					children: "保存配置"
				})
			})
		]
	});
}
function Pn({ label: e, value: t, disabled: n, onChange: r }) {
	let i = t.mode === "http" || t.mode === "socks5";
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, $.jsx)(ne, { children: e }),
			/* @__PURE__ */ (0, $.jsxs)(I, {
				"aria-label": e,
				selectedKey: t.mode,
				isDisabled: n,
				onSelectionChange: (e) => {
					e && r({
						...t,
						mode: String(e)
					});
				},
				children: [t.mode === "unknown" ? /* @__PURE__ */ (0, $.jsx)(L, {
					id: "unknown",
					children: "无法识别的代理类型"
				}) : null, jn.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(L, {
					id: e,
					children: t
				}, e))]
			}),
			i ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, $.jsx)(M, {
					className: "min-w-40 flex-1",
					label: `${e}地址`,
					value: t.host,
					autoComplete: "off",
					isDisabled: n,
					onChange: (e) => r({
						...t,
						host: e
					})
				}), /* @__PURE__ */ (0, $.jsx)(M, {
					className: "w-full sm:w-28",
					label: `${e}端口`,
					value: t.port ? String(t.port) : "",
					inputMode: "numeric",
					isDisabled: n,
					onChange: (e) => r({
						...t,
						port: Number(e)
					})
				})]
			}), /* @__PURE__ */ (0, $.jsxs)(b, {
				summary: "代理认证",
				children: [
					/* @__PURE__ */ (0, $.jsx)(M, {
						label: `${e}用户名`,
						value: t.username,
						autoComplete: "off",
						isDisabled: n,
						onChange: (e) => r({
							...t,
							username: e
						})
					}),
					/* @__PURE__ */ (0, $.jsx)(M, {
						label: `${e}密码`,
						type: "password",
						value: t.password || "",
						autoComplete: "new-password",
						isDisabled: n,
						placeholder: t.password_set ? "已保存，留空不改" : "可选",
						onChange: (e) => r({
							...t,
							password: e
						})
					}),
					t.password_set ? /* @__PURE__ */ (0, $.jsx)(v, {
						isSelected: !!t.clear_password,
						isDisabled: n,
						onChange: (e) => r({
							...t,
							clear_password: e
						}),
						children: "清除已保存的密码"
					}) : null
				]
			})] }) : null
		]
	});
}
// src/react/settings/library-icon-picker.tsx
var Fn = [
	["", "自动识别"],
	["hard-drive", "磁盘"],
	["database", "资料库"],
	["heart", "心动"],
	["heart-hand", "亲密"],
	["flame", "热情"],
	["cherry", "樱桃"],
	["lollipop", "甜心"],
	["candy", "糖果"],
	["banana", "香蕉"],
	["droplets", "湿润"],
	["venus", "女性"],
	["mars", "男性"],
	["venus-and-mars", "情侣"],
	["gem", "精选"],
	["crown", "女王"],
	["ribbon", "丝带"],
	["shirt", "制服"],
	["graduation-cap", "学生"],
	["stethoscope", "护士"],
	["glasses", "眼镜"],
	["footprints", "足迹"],
	["hand", "手部"],
	["flower", "花朵"],
	["venetian-mask", "角色扮演"],
	["rabbit", "兔女郎"],
	["paw-print", "兽耳"],
	["dumbbell", "健身"],
	["bed-double", "卧室"],
	["bath", "浴室"],
	["key-round", "私密"],
	["wine", "微醺"],
	["cigarette", "烟"],
	["moon", "夜色"],
	["sparkles", "幻想"],
	["camera", "写真"],
	["video", "影片"],
	["film", "电影"],
	["image", "图集"],
	["gamepad-2", "游戏"],
	["star", "收藏"],
	["tags", "主题"]
];
function In(e) {
	let t = e === "local" ? "" : fe[e];
	return t ? [t, "自动识别"] : ["hard-drive", "默认"];
}
var Ln = "auto";
function Rn({ value: t, label: r, kind: i = "local", onChange: a }) {
	let l = (0, Z.useRef)(null), [u, f] = (0, Z.useState)(!1), [p, m] = (0, Z.useState)(t), [h, g] = In(i);
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(d, {
		ref: l,
		variant: "secondary",
		className: "self-start",
		"aria-label": r,
		"aria-haspopup": "dialog",
		"aria-expanded": u,
		onClick: () => {
			m(t), f(!0);
		},
		children: /* @__PURE__ */ (0, $.jsxs)("span", {
			"data-icon-choice": !0,
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, $.jsx)(je, { mark: t || h }), ((e) => e && Fn.find(([t]) => t === e)?.[1] || g)(t)]
		})
	}), /* @__PURE__ */ (0, $.jsx)(n, {
		triggerRef: l,
		isOpen: u,
		onOpenChange: f,
		placement: "bottom start",
		offset: 4,
		className: pe,
		children: /* @__PURE__ */ (0, $.jsxs)(o, {
			"aria-label": `${r}可选图标`,
			className: "flex w-72 flex-col gap-3 outline-none",
			children: [
				/* @__PURE__ */ (0, $.jsx)(e, {
					slot: "title",
					className: "px-1 text-body-medium text-text-primary",
					children: "选择媒体库图标"
				}),
				/* @__PURE__ */ (0, $.jsx)(s, {
					"aria-label": "可选图标",
					value: p || Ln,
					onChange: (e) => m(e === Ln ? "" : e),
					className: "inline-grid grid-cols-7 gap-1",
					children: Fn.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(c, {
						value: e || Ln,
						"aria-label": e ? t : g,
						className: "flex h-10 cursor-pointer items-center justify-center rounded-lg text-foreground-icon-secondary outline-none hover:bg-dropdown-item-hover-background focus-visible:ring-2 focus-visible:ring-border-focus-ring data-selected:bg-dropdown-item-hover-background data-selected:text-text-primary",
						children: /* @__PURE__ */ (0, $.jsx)(je, { mark: e || h })
					}, e || Ln))
				}),
				/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex justify-end gap-2 border-t border-separator-border pt-2.5",
					children: [/* @__PURE__ */ (0, $.jsx)(d, {
						variant: "secondary",
						onClick: () => f(!1),
						children: "取消"
					}), /* @__PURE__ */ (0, $.jsx)(d, {
						disabled: p === t,
						onClick: () => {
							a(p), f(!1);
						},
						children: "应用"
					})]
				})
			]
		})
	})] });
}
// src/react/settings/library-policy-settings.tsx
var zn = [
	["probe", "读取视频信息"],
	["metadata", "联网补资料"],
	["cover", "联网补封面"],
	["people", "联网补人物图片"],
	["preview", "生成九宫格预览"]
], Bn = [
	"probe",
	"metadata",
	"cover",
	"people",
	"preview"
], Vn = [
	[
		"auto",
		"自动补全",
		"缺什么联网补什么"
	],
	[
		"local",
		"仅使用本地资料",
		"不联网，只用本地 NFO 和图片"
	],
	[
		"custom",
		"自定义",
		"逐项选择要做的步骤"
	]
];
function Hn() {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		"data-policy-legend": "",
		className: "flex flex-col gap-1",
		children: [/* @__PURE__ */ (0, $.jsx)(j, { children: ve }), /* @__PURE__ */ (0, $.jsxs)(b, {
			summary: "三种处理方式对比",
			children: [/* @__PURE__ */ (0, $.jsxs)("table", {
				"data-policy-matrix": "",
				className: "text-body-2-regular",
				children: [/* @__PURE__ */ (0, $.jsx)("thead", { children: /* @__PURE__ */ (0, $.jsxs)("tr", { children: [/* @__PURE__ */ (0, $.jsx)("th", {
					scope: "col",
					children: /* @__PURE__ */ (0, $.jsx)(a, { children: "步骤" })
				}), he.map((e) => /* @__PURE__ */ (0, $.jsx)("th", {
					scope: "col",
					children: e
				}, e))] }) }), /* @__PURE__ */ (0, $.jsx)("tbody", { children: _e.map(([e, ...t]) => /* @__PURE__ */ (0, $.jsxs)("tr", { children: [/* @__PURE__ */ (0, $.jsx)("th", {
					scope: "row",
					children: e
				}), t.map((e, t) => /* @__PURE__ */ (0, $.jsx)("td", {
					"data-policy-cell": e === "✓" ? "on" : e === "—" ? "off" : "choice",
					children: e === "✓" ? /* @__PURE__ */ (0, $.jsx)("span", {
						"aria-label": "做",
						children: "✓"
					}) : e === "—" ? /* @__PURE__ */ (0, $.jsx)("span", {
						"aria-label": "不做",
						children: "—"
					}) : e
				}, he[t]))] }, e)) })]
			}), /* @__PURE__ */ (0, $.jsx)(j, { children: ge })]
		})]
	});
}
function Un({ name: e, value: t, onChange: n }) {
	return /* @__PURE__ */ (0, $.jsx)(Oe, {
		className: "w-full",
		"aria-label": `${e} 处理方式`,
		selectedKey: t,
		prefix: "处理方式",
		renderValue: /* @__PURE__ */ (0, $.jsx)("span", {
			className: "truncate",
			children: Vn.find(([e]) => e === t)?.[1]
		}),
		onSelectionChange: (e) => n(String(e)),
		children: Vn.map(([e, t, n]) => /* @__PURE__ */ (0, $.jsx)(L, {
			id: e,
			textValue: t,
			children: /* @__PURE__ */ (0, $.jsxs)("span", {
				className: "flex min-w-0 flex-col",
				children: [/* @__PURE__ */ (0, $.jsx)("span", { children: t }), /* @__PURE__ */ (0, $.jsx)("span", {
					className: "text-body-2-regular text-text-secondary whitespace-normal",
					children: n
				})]
			})
		}, e))
	});
}
function Wn({ name: e, value: t, onChange: n }) {
	return /* @__PURE__ */ (0, $.jsx)(b, {
		defaultOpen: !0,
		summary: `${e} 的处理步骤（${t.length}/${zn.length}）`,
		children: /* @__PURE__ */ (0, $.jsx)("div", {
			className: "flex flex-wrap gap-x-6 gap-y-2",
			role: "group",
			"aria-label": `${e} 处理步骤`,
			children: zn.map(([e, r]) => /* @__PURE__ */ (0, $.jsx)(v, {
				isSelected: t.includes(e),
				onChange: (r) => n(r ? [...t, e] : t.filter((t) => t !== e)),
				children: r
			}, e))
		})
	});
}
function Gn({ id: e, name: t, value: i, onChange: a }) {
	let s = (0, Z.useRef)(null), [c, u] = (0, Z.useState)(!1), d = l.find(([e]) => e === i)?.[1] || "无颜色", f = (t) => {
		a(t), it(e, t), u(!1);
	};
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsxs)("button", {
		ref: s,
		type: "button",
		className: "text-body-medium",
		"data-glow-chip": "",
		"data-library-color-trigger": "",
		"aria-haspopup": "dialog",
		"aria-expanded": c,
		"aria-label": `${t || "未命名媒体库"} 来源色：${d}`,
		title: d,
		onClick: () => u(!0),
		children: [
			/* @__PURE__ */ (0, $.jsx)("span", {
				"aria-hidden": !0,
				className: "text-text-tertiary",
				children: "来源色"
			}),
			i ? /* @__PURE__ */ (0, $.jsx)("span", {
				"data-glow-ball": "",
				"aria-hidden": "true",
				"data-accent-ball": i
			}) : /* @__PURE__ */ (0, $.jsx)("span", {
				"data-glow-ball": "",
				"data-library-none": "",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, $.jsx)("span", { children: d })
		]
	}), /* @__PURE__ */ (0, $.jsx)(r, {
		getContainer: () => nt(s.current),
		children: /* @__PURE__ */ (0, $.jsx)(n, {
			triggerRef: s,
			isOpen: c,
			onOpenChange: u,
			placement: "bottom start",
			offset: 8,
			containerPadding: 12,
			className: pe,
			children: /* @__PURE__ */ (0, $.jsxs)(o, {
				"aria-label": `${t || "未命名媒体库"} 来源色`,
				className: "outline-none",
				children: [/* @__PURE__ */ (0, $.jsx)("p", {
					className: "px-1 pb-2 text-body-medium text-text-primary",
					children: "选择来源色"
				}), /* @__PURE__ */ (0, $.jsxs)("div", {
					"data-accent-grid": "",
					"data-library-colors": "",
					role: "group",
					children: [/* @__PURE__ */ (0, $.jsx)("button", {
						type: "button",
						"data-glow-chip": "",
						"aria-pressed": !i,
						title: "无颜色",
						"aria-label": "无颜色",
						onClick: () => f(""),
						children: /* @__PURE__ */ (0, $.jsx)("span", {
							"data-glow-ball": "",
							"data-library-none": "",
							"aria-hidden": "true"
						})
					}), l.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)("button", {
						type: "button",
						"data-glow-chip": "",
						"aria-pressed": e === i,
						title: t,
						"aria-label": t,
						onClick: () => f(e),
						children: /* @__PURE__ */ (0, $.jsx)("span", {
							"data-glow-ball": "",
							"aria-hidden": "true",
							"data-accent-ball": e
						})
					}, e))]
				})]
			})
		})
	})] });
}
// src/react/settings/push-discovery-settings.tsx
var Kn = "/api/configuration/push-discovery", qn = "/api/configuration/push-discovery/secret";
function Jn({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)(e.prefixes), [o, s] = (0, Z.useState)(""), c = Y(), l = n.media_roots, [u, f] = (0, Z.useState)(e), p = (e, n) => {
		r(e), f(e), a(e.prefixes), s(""), t(n);
	}, m = (e, t) => a((n) => n.map((n, r) => r === e ? {
		...n,
		...t
	} : n)), h = (e) => {
		e.preventDefault();
		let t = {
			enabled: n.enabled,
			watch_local: n.watch_local,
			cloud: n.cloud,
			prefixes: i
		};
		c.run("save", (e) => W(Kn, t, "POST", e), (e) => p(e, "已保存配置"), (e) => s(K(e)));
	}, g = () => {
		c.run("secret", (e) => W(qn, {}, "POST", e), (e) => p(e, "已更换共享密钥"), (e) => s(K(e)));
	}, _ = `已入库 ${u.queue.ingested} 个文件` + (u.queue.failed ? `，${u.queue.failed} 个入库失败` : "") + (u.queue.pending ? `，队列里还有 ${u.queue.pending} 条` : ""), v = u.local_running ? `正在监视 ${u.local_roots.join("、")}` : u.local_message || "没有运行";
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "pushDiscovery",
		title: "自动发现新文件",
		onSubmit: h,
		children: [
			/* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, $.jsx)("span", {
					className: "text-body-regular text-text-secondary",
					children: "本机监视"
				}), /* @__PURE__ */ (0, $.jsx)(V, {
					tone: !u.enabled || !u.watch_local ? "neutral" : u.local_running ? "progress" : "warning",
					children: !u.enabled || !u.watch_local ? "未启用" : u.local_running ? "运行中" : "未运行"
				})]
			}) }),
			/* @__PURE__ */ (0, $.jsxs)(P, { children: [
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "发现新文件后自动入库",
					description: u.enabled ? _ : void 0,
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "发现新文件后自动入库",
						isSelected: n.enabled,
						isDisabled: !n.available,
						onChange: (e) => r({
							...n,
							enabled: e
						})
					})
				}),
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "监视本机文件夹",
					description: u.enabled && u.watch_local ? v : void 0,
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "监视本机文件夹",
						isSelected: n.watch_local,
						isDisabled: !n.available || !n.enabled,
						onChange: (e) => r({
							...n,
							watch_local: e
						})
					})
				}),
				/* @__PURE__ */ (0, $.jsx)(R, {
					label: "接收 CloudDrive2 通知",
					children: /* @__PURE__ */ (0, $.jsx)(H, {
						"aria-label": "接收 CloudDrive2 通知",
						isSelected: n.cloud,
						isDisabled: !n.available || !n.enabled,
						onChange: (e) => r({
							...n,
							cloud: e
						})
					})
				}),
				u.enabled && u.cloud ? /* @__PURE__ */ (0, $.jsx)(R, {
					label: "Webhook 配置",
					description: u.config_toml ? "贴进 CloudDrive2「设置 → Webhooks」，需要会员；更换密钥后要重贴。" : u.origin ? "还没有共享密钥，保存配置后生成。" : "要先有 CloudDrive2 能访问的局域网地址才能生成。"
				}) : null
			] }),
			u.enabled && u.queue.last_error ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(N, {
					tone: "error",
					title: "最近一次入库失败",
					children: u.queue.last_error
				})
			}) : null,
			u.enabled && u.cloud && u.config_toml ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)("div", {
					className: "flex flex-col gap-3",
					children: /* @__PURE__ */ (0, $.jsxs)(b, {
						summary: "查看配置",
						children: [/* @__PURE__ */ (0, $.jsx)(St, {
							code: u.config_toml,
							language: "toml",
							label: "CloudDrive2 配置",
							bounded: !1,
							copyLabel: "复制配置",
							onCopy: () => t("已复制 CloudDrive2 配置")
						}), /* @__PURE__ */ (0, $.jsx)(j, { children: "Windows 桌面版粘贴后显示「无效」时，把这段存成 .toml 文件，放进 %LOCALAPPDATA%\\CloudDrive.WinUI\\webhooks\\ 目录。" })]
					})
				})
			}) : null,
			n.enabled && n.cloud ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, $.jsx)(ne, { children: "云端路径前缀" }),
						/* @__PURE__ */ (0, $.jsx)("div", {
							role: "group",
							"aria-label": "云端路径前缀",
							className: "flex flex-col gap-3",
							children: i.map((e, t) => /* @__PURE__ */ (0, $.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [
									/* @__PURE__ */ (0, $.jsx)(M, {
										className: "min-w-0 flex-1",
										"aria-label": `云端路径前缀 ${t + 1}`,
										placeholder: "/115",
										autoComplete: "off",
										maxLength: 200,
										value: e.prefix,
										onChange: (e) => m(t, { prefix: e })
									}),
									/* @__PURE__ */ (0, $.jsx)(Oe, {
										"aria-label": `前缀 ${t + 1} 对应的媒体根`,
										prefix: "对应目录",
										selectedKey: e.root,
										onSelectionChange: (e) => {
											e !== null && m(t, { root: String(e) });
										},
										children: l.map((e) => /* @__PURE__ */ (0, $.jsx)(L, {
											id: e,
											children: e
										}, e))
									}),
									/* @__PURE__ */ (0, $.jsx)(d, {
										variant: "danger",
										iconOnly: !0,
										leadingIcon: le,
										"aria-label": "移除这一条",
										onClick: () => a((e) => e.filter((e, n) => n !== t))
									})
								]
							}, t))
						}),
						/* @__PURE__ */ (0, $.jsx)("div", { children: /* @__PURE__ */ (0, $.jsx)(d, {
							variant: "secondary",
							onClick: () => a((e) => [...e, {
								prefix: "",
								root: l[0] ?? ""
							}]),
							children: "添加前缀"
						}) })
					]
				})
			}) : null,
			o || c.error ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(C, { children: o || c.error })
			}) : null,
			/* @__PURE__ */ (0, $.jsxs)(A, { children: [u.enabled && u.cloud && u.config_toml ? /* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				onClick: g,
				disabled: !n.available,
				...G(c.busy === "secret"),
				children: "更换密钥"
			}) : null, /* @__PURE__ */ (0, $.jsx)(d, {
				type: "submit",
				disabled: !n.available,
				...G(c.busy === "save"),
				children: "保存配置"
			})] })
		]
	});
}
// src/react/settings/media-settings.tsx
var Yn = (e) => Et.find(([t]) => t === e)?.[1] ?? e, Xn = [...Et, ["smb", "SMB 共享"]], Zn = (e) => e.library_icon || In(e.transport === "smb" ? "smb" : e.location)[0], Qn = async (e) => (await W(me, { initial: e })).path, $n = (e) => ({
	library_id: e.library_id,
	library: e.library,
	library_icon: e.library_icon,
	library_color: e.library_color,
	library_policy: e.library_policy,
	library_stages: e.library_stages
}), er = (e) => e.library_stages ? Bn.filter((t) => e.library_stages.split(",").includes(t)) : [], tr = (e = "") => ({
	path: e,
	transport: e.startsWith("smb://") ? "smb" : "filesystem",
	location: "local",
	root: "",
	library_id: ot(),
	library: "",
	library_icon: "",
	library_color: "",
	library_policy: "auto",
	library_stages: "",
	cost: "free"
});
function nr(e) {
	let t = e.media_sources?.filter((e) => Et.some(([t]) => t === e.location));
	return t?.length ? t.map((e) => ({
		transport: e.transport === "smb" || e.path.startsWith("smb://") ? "smb" : "filesystem",
		smb_username: e.smb_username,
		smb_password: "",
		smb_encrypt: e.smb_encrypt,
		smb_password_saved: e.smb_password_saved,
		path: e.path,
		location: e.location,
		root: e.root,
		library: e.library || "",
		library_icon: e.library_icon || "",
		library_color: e.library_color || "",
		library_policy: e.library_policy || "auto",
		library_stages: e.library_stages || "",
		root_id: e.root_id,
		library_id: e.library_id || ot(),
		cost: e.cost ?? mt(e.location)
	})) : (e.media_dirs.length ? e.media_dirs : [""]).map((e) => tr(e));
}
function rr(e) {
	let t = nr(e), n = new URLSearchParams(window.location.search), r = n.get("vvs_folder") || "";
	if (!r || !r.startsWith("/") || t.some((e) => e.path === r)) return t;
	let i = tr(r);
	return i.library = n.get("vvs_library") || "本地影片", n.get("vvs_cloud") === "1" && (i.location = "mounted", i.cost = "metered"), [...t.filter((e) => e.path), i];
}
var ir = (e) => !(e instanceof u) || e.status !== 400 ? null : e.body?.errors ?? null;
function ar({ data: e, receipt: t, panel: n }) {
	let r = !!e.media_sources?.some((e) => At(e.location));
	return (0, Z.useEffect)(() => {
		if (e.editable) {
			let t = /* @__PURE__ */ new Map();
			for (let n of rr(e)) t.set(n.library_id, (t.get(n.library_id) ?? 0) + 1);
			J("media", {
				folders: [...t.values()],
				cloud: r
			});
		}
		let t = e.push_discovery;
		t && J("discovery", {
			enabled: t.enabled,
			watchLocal: t.watch_local,
			cloud: t.cloud,
			webhook: t.enabled && t.cloud && !!t.config_toml,
			prefixes: t.prefixes.length
		});
	}, [e, r]), /* @__PURE__ */ (0, $.jsxs)("div", {
		...Q(n),
		children: [
			e.editable ? /* @__PURE__ */ (0, $.jsx)(or, {
				data: e,
				receipt: t
			}) : /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "neutral",
				title: "只读",
				children: e.notice
			}),
			e.editable ? null : /* @__PURE__ */ (0, $.jsx)(cr, { data: e }),
			r ? /* @__PURE__ */ (0, $.jsx)(Mn, { receipt: t }) : null,
			e.push_discovery ? /* @__PURE__ */ (0, $.jsx)(Jn, {
				initial: e.push_discovery,
				receipt: t
			}) : null
		]
	});
}
function or({ data: e, receipt: t }) {
	let { rows: n, edit: r, add: i, remove: a, errors: o, setErrors: s, picking: c, pick: l, inputRef: u } = Mt({
		initial: () => rr(e),
		blank: () => tr(),
		pickFolder: Qn,
		describe: K
	}), [f, p] = (0, Z.useState)(!1), [m, h] = (0, Z.useState)(!1), [_, y] = (0, Z.useState)(""), [b, x] = (0, Z.useState)({}), [S, ee] = (0, Z.useState)(null), C = (0, Z.useRef)(e.revision), T = Y();
	gt();
	let E = (e, t) => {
		n.forEach((i, a) => {
			i.library_id === n[e].library_id && r(a, t);
		});
	}, D = [...n.reduce((e, t) => e.has(t.library_id) ? e : e.set(t.library_id, t), /* @__PURE__ */ new Map()).values()], [O, k] = (0, Z.useState)(null);
	(0, Z.useEffect)(() => {
		if (!O) return;
		let e = document.querySelector(`[data-library-key="${CSS.escape(O)}"] [data-library-head] input`);
		e?.scrollIntoView({ block: "center" }), e?.focus(), k(null);
	}, [O]);
	let te = (e, t) => {
		let i = n.find((e) => e.library_id === t);
		if (i) {
			r(e, $n(i));
			return;
		}
		let a = ot();
		r(e, {
			library_id: a,
			library: "",
			library_icon: "",
			library_color: "",
			library_policy: "auto",
			library_stages: ""
		}), k(a);
	};
	(0, Z.useEffect)(() => {
		if (!S) return;
		let e = setTimeout(() => location.assign(S.url), En);
		return () => clearTimeout(e);
	}, [S]);
	let ne = (r) => {
		r.preventDefault();
		let i = n.findIndex((e) => !e.cost);
		if (i >= 0) {
			h(!0);
			let e = r.currentTarget;
			requestAnimationFrame(() => e.querySelector(`[data-media-read-policy="${i}"] button`)?.focus());
		} else y(""), T.run("save", (t) => W(g, {
			revision: C.current,
			media_dirs: n.map((e) => e.path),
			...e.media_sources ? { media_sources: n } : {},
			port: String(e.port),
			scan_now: f
		}, "POST", t), (e) => {
			C.current = e.revision, s([]), t("已保存配置"), ee(e);
		}, (e) => {
			let t = ir(e);
			s(t?.media_dirs ?? []), (!t || t.port) && y(t?.port || K(e));
		});
	};
	if (S) return /* @__PURE__ */ (0, $.jsx)(F, {
		title: "媒体库与目录",
		children: /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsxs)(N, {
			tone: "success",
			title: "配置已保存",
			children: [
				"Peach 正在重新启动。稍后自动跳转，或点击",
				/* @__PURE__ */ (0, $.jsx)(se, {
					href: S.url,
					size: "small",
					children: "进入馆藏"
				}),
				"。"
			]
		}) })
	});
	let re = (t) => e.media_sources?.find((e) => e.root_id === t.root_id && e.path === t.path), ae = n.some((e) => At(e.location)), oe = ae ? (e.mount_dependencies ?? []).filter((e) => !e.available) : [];
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "媒体库与目录",
		onSubmit: ne,
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [
			/* @__PURE__ */ (0, $.jsx)(Hn, {}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				role: "group",
				"aria-label": "媒体库与目录",
				className: "flex flex-col gap-4",
				children: D.map((e) => {
					let t = n.findIndex((t) => t.library_id === e.library_id), s = n.map((e, t) => ({
						row: e,
						index: t
					})).filter(({ row: t }) => t.library_id === e.library_id), f = e.library_policy, p = e.library || "未命名媒体库";
					return /* @__PURE__ */ (0, $.jsxs)("div", {
						"data-library-block": "",
						"data-library-key": e.library_id,
						className: Re({
							variant: "raised",
							padding: "none",
							className: "flex flex-col p-2"
						}),
						"data-library": e.library_color ? e.library_id : void 0,
						children: [
							/* @__PURE__ */ (0, $.jsxs)("div", {
								"data-library-head": "",
								children: [
									/* @__PURE__ */ (0, $.jsx)(Rn, {
										label: `${p} 图标`,
										value: e.library_icon,
										kind: e.transport === "smb" ? "smb" : e.location,
										onChange: (e) => E(t, { library_icon: e })
									}),
									/* @__PURE__ */ (0, $.jsx)(M, {
										className: "w-full",
										"aria-label": `${p} 名称`,
										maxLength: 80,
										placeholder: "媒体库名称",
										value: e.library,
										onChange: (e) => E(t, { library: e })
									}),
									/* @__PURE__ */ (0, $.jsx)(Gn, {
										id: e.library_id,
										name: e.library,
										value: e.library_color,
										onChange: (e) => E(t, { library_color: e })
									}),
									/* @__PURE__ */ (0, $.jsx)(Un, {
										name: p,
										value: f,
										onChange: (n) => E(t, {
											library_policy: n,
											library_stages: n === "custom" ? e.library_stages || Bn.join(",") : ""
										})
									})
								]
							}),
							f === "custom" ? /* @__PURE__ */ (0, $.jsx)(Wn, {
								name: p,
								value: er(e),
								onChange: (e) => E(t, { library_stages: Bn.filter((t) => e.includes(t)).join(",") })
							}) : null,
							/* @__PURE__ */ (0, $.jsxs)("div", {
								"data-library-folders": "",
								role: "group",
								"aria-label": `${p} 的文件夹`,
								children: [s.map(({ row: t, index: i }) => /* @__PURE__ */ (0, $.jsxs)(Tt, {
									label: `媒体目录 ${i + 1}`,
									path: t.path,
									onPath: (e) => r(i, {
										path: e,
										transport: e.startsWith("smb://") ? "smb" : t.transport
									}),
									error: o[i],
									inputRef: u(i),
									picking: c === i,
									onPick: () => void l(i),
									onRemove: n.length > 1 ? () => a(i) : void 0,
									status: re(t) ? /* @__PURE__ */ (0, $.jsx)(sr, { online: re(t)?.online }) : null,
									children: [/* @__PURE__ */ (0, $.jsxs)(wt, { children: [
										/* @__PURE__ */ (0, $.jsx)(kt, {
											index: i,
											value: t.transport === "smb" ? "smb" : t.location,
											options: Xn,
											onChange: (e) => {
												let n = e === "smb";
												r(i, {
													transport: n ? "smb" : "filesystem",
													location: n ? "local" : e,
													cost: n || e === "local" ? "free" : "",
													path: n ? t.path.startsWith("smb://") ? t.path : "smb://" : t.path.startsWith("smb://") ? "" : t.path
												}), x((e) => {
													let t = { ...e };
													return delete t[i], t;
												});
											}
										}),
										/* @__PURE__ */ (0, $.jsx)(Dt, {
											index: i,
											cost: t.cost,
											onChange: (e) => r(i, { cost: e }),
											error: m && !t.cost ? "请选择媒体读取策略" : void 0
										}),
										t.root_id && !re(t) ? /* @__PURE__ */ (0, $.jsx)(Ct, {
											label: "变更方式",
											className: "w-full @lg:w-auto @lg:flex-1",
											children: /* @__PURE__ */ (0, $.jsxs)(I, {
												className: "w-full",
												"aria-label": `目录变更方式 ${i + 1}`,
												placeholder: "选择目录变更方式",
												selectedKey: t.change_mode || null,
												onSelectionChange: (e) => {
													e === "add" ? r(i, {
														root_id: void 0,
														root: "",
														change_mode: ""
													}) : r(i, { change_mode: "relocate" });
												},
												children: [/* @__PURE__ */ (0, $.jsx)(L, {
													id: "relocate",
													children: "重定位此目录，保留文件记录"
												}), /* @__PURE__ */ (0, $.jsx)(L, {
													id: "add",
													children: "添加另一目录"
												})]
											})
										}) : null,
										D.length > 1 ? /* @__PURE__ */ (0, $.jsx)(Ct, {
											label: "移到媒体库",
											className: "w-full @lg:w-48",
											children: /* @__PURE__ */ (0, $.jsxs)(I, {
												className: "w-full",
												"aria-label": `目录所属媒体库 ${i + 1}`,
												selectedKey: t.library_id,
												renderValue: /* @__PURE__ */ (0, $.jsxs)("span", {
													className: "flex min-w-0 items-center gap-2",
													children: [/* @__PURE__ */ (0, $.jsx)(je, { mark: Zn(e) }), /* @__PURE__ */ (0, $.jsx)("span", {
														className: "truncate",
														children: p
													})]
												}),
												onSelectionChange: (e) => {
													e && te(i, String(e));
												},
												children: [D.map((e) => /* @__PURE__ */ (0, $.jsx)(L, {
													id: e.library_id,
													textValue: e.library || "未命名媒体库",
													children: /* @__PURE__ */ (0, $.jsxs)("span", {
														className: "flex min-w-0 items-center gap-2",
														children: [/* @__PURE__ */ (0, $.jsx)(je, { mark: Zn(e) }), /* @__PURE__ */ (0, $.jsx)("span", {
															className: "truncate",
															children: e.library || "未命名媒体库"
														})]
													})
												}, e.library_id)), s.length > 1 ? /* @__PURE__ */ (0, $.jsx)(L, {
													id: "new",
													textValue: "新建媒体库",
													children: /* @__PURE__ */ (0, $.jsxs)("span", {
														className: "flex min-w-0 items-center gap-2",
														children: [/* @__PURE__ */ (0, $.jsx)(je, { mark: "plus" }), /* @__PURE__ */ (0, $.jsx)("span", { children: "新建媒体库" })]
													})
												}) : null]
											})
										}) : null
									] }), t.transport === "smb" ? /* @__PURE__ */ (0, $.jsxs)("div", {
										className: "flex w-full flex-col gap-2",
										children: [
											/* @__PURE__ */ (0, $.jsxs)(wt, { children: [/* @__PURE__ */ (0, $.jsx)(Ct, {
												label: "SMB 账号",
												className: "w-full @lg:flex-1",
												children: /* @__PURE__ */ (0, $.jsx)(M, {
													"aria-label": `SMB 账号 ${i + 1}`,
													value: t.smb_username || "",
													autoComplete: "off",
													onChange: (e) => r(i, { smb_username: e })
												})
											}), /* @__PURE__ */ (0, $.jsx)(Ct, {
												label: "SMB 密码",
												className: "w-full @lg:flex-1",
												children: /* @__PURE__ */ (0, $.jsx)(M, {
													"aria-label": `SMB 密码 ${i + 1}`,
													type: "password",
													value: t.smb_password || "",
													autoComplete: "new-password",
													placeholder: t.smb_password_saved ? "留空保留已保存密码" : "",
													onChange: (e) => r(i, { smb_password: e })
												})
											})] }),
											/* @__PURE__ */ (0, $.jsx)(v, {
												isSelected: t.smb_encrypt || !1,
												onChange: (e) => r(i, { smb_encrypt: e }),
												children: "要求 SMB 加密"
											}),
											/* @__PURE__ */ (0, $.jsx)(v, {
												isSelected: t.smb_clear || !1,
												onChange: (e) => r(i, { smb_clear: e }),
												children: "移除已保存的 SMB 账号"
											}),
											/* @__PURE__ */ (0, $.jsx)(d, {
												className: "self-start",
												variant: "secondary",
												...G(T.busy === `smb-${i}`),
												onClick: () => void T.run(`smb-${i}`, (e) => W("/api/configuration/smb/test", t, "POST", e), (e) => x((t) => ({
													...t,
													[i]: {
														message: "共享目录可读取",
														directories: e.directories
													}
												})), (e) => x((t) => ({
													...t,
													[i]: {
														message: K(e),
														directories: []
													}
												}))),
												children: "测试连接"
											}),
											b[i] ? /* @__PURE__ */ (0, $.jsx)(j, { children: b[i].message }) : null,
											b[i]?.directories.length ? /* @__PURE__ */ (0, $.jsx)(I, {
												"aria-label": `SMB 子目录 ${i + 1}`,
												placeholder: "进入子目录",
												selectedKey: null,
												onSelectionChange: (e) => {
													e && (r(i, { path: t.path.replace(/\/$/, "") + "/" + encodeURIComponent(String(e)) }), x((e) => ({
														...e,
														[i]: {
															message: "请测试此子目录",
															directories: []
														}
													})));
												},
												children: b[i].directories.map((e) => /* @__PURE__ */ (0, $.jsx)(L, {
													id: e,
													children: e
												}, e))
											}) : null,
											/* @__PURE__ */ (0, $.jsx)(j, { children: "地址填写 smb://服务器/共享/目录。按共享账号权限读写；整理和删除由对应操作触发，资料和预览保存在 Peach 数据目录。" })
										]
									}) : null]
								}, i)), /* @__PURE__ */ (0, $.jsx)("div", {
									className: "flex",
									children: /* @__PURE__ */ (0, $.jsx)(d, {
										variant: "secondary",
										"aria-label": `给 ${p} 添加文件夹`,
										onClick: () => {
											i(), r(n.length, {
												...$n(e),
												location: e.location,
												cost: e.cost
											});
										},
										children: "添加文件夹"
									})
								})]
							})
						]
					}, e.library_id);
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				className: "self-start",
				onClick: i,
				children: "添加媒体库"
			}),
			/* @__PURE__ */ (0, $.jsx)(j, { children: ie }),
			ae ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Ot, {}), /* @__PURE__ */ (0, $.jsx)(kn, {})] }) : null,
			oe.map((e) => /* @__PURE__ */ (0, $.jsxs)(j, { children: [
				"未检测到 ",
				e.name,
				"。",
				/* @__PURE__ */ (0, $.jsxs)(w, {
					href: e.download_url,
					children: ["下载 ", e.name]
				})
			] }, e.name)),
			/* @__PURE__ */ (0, $.jsx)(v, {
				isSelected: f,
				onChange: p,
				children: "保存后扫描并补全资料"
			}),
			_ ? /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "error",
				title: "没有保存",
				children: _
			}) : null
		] }), /* @__PURE__ */ (0, $.jsx)(A, {
			status: "保存后 Peach 会重新启动。",
			children: /* @__PURE__ */ (0, $.jsx)(d, {
				type: "submit",
				...G(T.busy === "save"),
				children: "保存配置"
			})
		})]
	});
}
function sr({ online: e }) {
	return /* @__PURE__ */ (0, $.jsx)(Nt, { online: e });
}
function cr({ data: e }) {
	let t = e.media_sources, n = Y();
	return t ? /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "挂载状态",
		children: [
			/* @__PURE__ */ (0, $.jsx)(te, { children: t.map((e, t) => /* @__PURE__ */ (0, $.jsxs)(k, {
				term: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(je, { mark: jt(e.location) }), Yn(e.location)] }),
				children: [e.path || "未配置挂载点", /* @__PURE__ */ (0, $.jsx)(sr, { online: e.online })]
			}, t)) }),
			n.error ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(C, { children: n.error })
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				onClick: () => void n.run("refresh", (e) => Ge(e), (e) => q.setQueryData(h, e)),
				...G(n.busy === "refresh"),
				children: "刷新挂载状态"
			}) })
		]
	}) : null;
}
// src/react/settings/service-preferences.tsx
var lr = [
	["off", "关闭"],
	["precise", "每 10 秒一张"],
	["coarse", "每 30 秒一张"]
];
function ur({ epoch: e = 0, disabled: t = !1 }) {
	let n = X({
		queryKey: Me,
		queryFn: ({ signal: e }) => Ze(e),
		refetchOnMount: "always"
	}), r = xt(), i = r.reset;
	(0, Z.useEffect)(() => {
		i();
	}, [e, i]);
	let a = n.data, o = r.error || n.error;
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
			label: "时间轴预览",
			description: "按所选间隔抽帧，仅处理本机磁盘上的视频。",
			children: /* @__PURE__ */ (0, $.jsx)("div", {
				id: "videoThumbnailSetting",
				children: /* @__PURE__ */ (0, $.jsx)(I, {
					"aria-label": "缩略图采集间隔",
					selectedKey: a?.mode || "off",
					isDisabled: t || !a || n.isFetching || r.isPending,
					onSelectionChange: (e) => {
						e !== null && r.mutate(String(e));
					},
					children: lr.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(L, {
						id: e,
						children: t
					}, e))
				})
			})
		}) }),
		r.isPending || a?.status === "running" ? /* @__PURE__ */ (0, $.jsx)(B, {
			divided: !0,
			children: /* @__PURE__ */ (0, $.jsx)(j, {
				role: "status",
				children: r.isPending ? "正在保存…" : "正在采集，进度在活动页查看。"
			})
		}) : null,
		o ? /* @__PURE__ */ (0, $.jsx)(B, {
			divided: !0,
			children: /* @__PURE__ */ (0, $.jsx)(C, { children: K(o) })
		}) : null
	] });
}
function dr({ receipt: e }) {
	let t = Ie();
	(0, Z.useSyncExternalStore)(t.subscribe, t.version);
	let n = X({
		queryKey: we,
		queryFn: ({ signal: e }) => Xe(e),
		refetchOnMount: "always"
	}), r = bt(), i = n.data?.followInitialDays ?? t.value.followInitialDays, a = r.error || n.error;
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "关注采集",
		children: [/* @__PURE__ */ (0, $.jsxs)(P, { children: [
			/* @__PURE__ */ (0, $.jsx)(fr, {}),
			/* @__PURE__ */ (0, $.jsx)(pr, {}),
			/* @__PURE__ */ (0, $.jsx)(R, {
				label: "首次采集范围",
				children: /* @__PURE__ */ (0, $.jsx)("div", {
					id: "followInitialDaysSetting",
					children: /* @__PURE__ */ (0, $.jsx)(I, {
						"aria-label": "首次采集范围",
						selectedKey: String(i),
						isDisabled: n.isFetching || r.isPending,
						onSelectionChange: (n) => {
							n !== null && r.mutate({ followInitialDays: Number(n) }, { onSuccess: (n) => {
								typeof n.followInitialDays == "number" && (t.value.followInitialDays = n.followInitialDays), t.save(), e("已保存首次采集范围");
							} });
						},
						children: D.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(L, {
							id: e,
							children: t
						}, e))
					})
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(R, {
				label: "头像刷新",
				children: "每 3 个月"
			}),
			/* @__PURE__ */ (0, $.jsx)(R, {
				label: "favicon 刷新",
				children: "每年"
			})
		] }), a ? /* @__PURE__ */ (0, $.jsx)(B, {
			divided: !0,
			children: /* @__PURE__ */ (0, $.jsx)(C, { children: K(a) })
		}) : null]
	});
}
function fr() {
	let e = X({
		queryKey: O,
		queryFn: ({ signal: e }) => Je(e),
		refetchOnMount: "always",
		refetchInterval: (e) => ut(e.state.data)
	}), t = yt(), n = e.data, r = (0, Z.useRef)(Le(Number(localStorage.getItem("peach.number.followScheduleSetting")), 15, 10080, 60)), [i, a] = (0, Z.useState)("60"), [o, s] = (0, Z.useState)(!1);
	(0, Z.useEffect)(() => {
		n?.enabled && (r.current = n.interval_minutes, a(String(n.interval_minutes)));
	}, [n]);
	let c = !n?.available || e.isFetching || t.isPending, l = () => {
		let e = Number(i);
		!Number.isInteger(e) || e < 15 || e > 10080 ? s(!0) : (s(!1), n?.enabled && !c && e !== n.interval_minutes && (r.current = e, localStorage.setItem("peach.number.followScheduleSetting", String(e)), t.mutate(e)));
	}, u = t.error || e.error;
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsx)(R, {
			label: "自动检查更新",
			children: /* @__PURE__ */ (0, $.jsxs)("div", {
				id: "followScheduleSetting",
				className: "flex min-h-9 min-w-0 flex-wrap items-center justify-end gap-2",
				children: [/* @__PURE__ */ (0, $.jsx)(H, {
					"aria-label": "自动检查更新",
					isSelected: n?.enabled === !0,
					isDisabled: c,
					onChange: (e) => {
						localStorage.setItem("peach.number.followScheduleSetting", String(r.current)), t.mutate(e ? r.current : 0);
					}
				}), n?.enabled ? /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, $.jsx)(M, {
						type: "number",
						inputMode: "numeric",
						name: "follow-interval",
						autoComplete: "off",
						"aria-label": "自动检查间隔",
						className: "w-24",
						value: i,
						onChange: (e) => {
							a(e), s(!1);
						},
						onBlur: l,
						onKeyDown: (e) => {
							e.key === "Enter" && (e.preventDefault(), l());
						},
						isDisabled: c,
						isInvalid: o
					}), /* @__PURE__ */ (0, $.jsx)("span", {
						className: "text-body-2-regular text-text-secondary",
						children: "分钟"
					})]
				}) : null]
			})
		}),
		o ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(C, { children: "请输入 15–10080 的整数（分钟）。" }) }) : null,
		t.isPending || n?.running ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(j, {
			role: "status",
			children: t.isPending ? "正在保存…" : "正在检查来源更新…"
		}) }) : null,
		/* @__PURE__ */ (0, $.jsx)(mr, {
			kind: "follow",
			status: n,
			title: "上次自动检查失败"
		}),
		u ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(C, { children: K(u) }) }) : null
	] });
}
function pr() {
	let e = X({
		queryKey: T,
		queryFn: ({ signal: e }) => qe(e),
		refetchOnMount: "always",
		refetchInterval: (e) => ut(e.state.data)
	}), t = e.data;
	if (!t) return e.isPending ? /* @__PURE__ */ (0, $.jsx)(R, {
		label: "订阅源拉取",
		children: /* @__PURE__ */ (0, $.jsx)("span", {
			"data-skeleton": !0,
			"aria-busy": "true",
			"aria-label": "正在读取订阅源拉取间隔",
			className: "block h-4 w-16 rounded-2lg bg-background-tertiary-default"
		})
	}) : null;
	let n = t.interval_minutes, r = n % 60 ? `每 ${n} 分钟` : `每 ${n / 60} 小时`;
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsx)(R, {
			label: "订阅源拉取",
			children: /* @__PURE__ */ (0, $.jsx)("span", {
				id: "feedScheduleSetting",
				children: t.available ? t.enabled ? r : "已关闭" : "只在写入端可用"
			})
		}),
		t.running ? /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(j, {
			role: "status",
			children: "正在拉取订阅源…"
		}) }) : null,
		/* @__PURE__ */ (0, $.jsx)(mr, {
			kind: "feed",
			status: t,
			title: "上次自动拉取失败"
		})
	] });
}
function mr({ kind: e, status: t, title: n }) {
	let r = vt(e);
	if (!t?.enabled || t.running || !t.last_error) return null;
	let i = t.consecutive_failures ?? 0, a = tt(t.next_run_at), o = [i > 1 ? `已连续失败 ${i} 次` : "", a ? `下一轮 ${a}` : ""].filter(Boolean).join("，"), s = [
		t.last_error,
		o,
		r.error ? `没有重试：${K(r.error)}` : ""
	].filter(Boolean).join("\n");
	return /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)(N, {
		tone: "error",
		title: n,
		action: /* @__PURE__ */ (0, $.jsx)(d, {
			variant: "secondary",
			size: "small",
			disabled: !t.available,
			...G(r.isPending),
			onClick: () => r.mutate(),
			children: "立即重试"
		}),
		children: s
	}) });
}
// src/react/settings/media-processing-settings.tsx
function hr({ receipt: e }) {
	let t = X({
		queryKey: ue,
		queryFn: ({ signal: e }) => Ye(e)
	}), n = Y(), r = n.error || (t.error ? K(t.error) : ""), i = !t.data || t.isFetching || !!n.busy;
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "视频预览",
		children: [
			/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
				label: "生成视频预览",
				description: "为本地视频生成九宫格与时间轴预览；关闭后仍按入库规则探测时长与分辨率。",
				children: /* @__PURE__ */ (0, $.jsx)(H, {
					"aria-label": "生成视频预览",
					isSelected: !!t.data && !t.data.metadata_only,
					isDisabled: i,
					onChange: (t) => void n.run("save", (e) => W(de, { metadata_only: !t }, "POST", e), (t) => {
						q.setQueryData(ue, t), q.invalidateQueries({ queryKey: Me }), q.invalidateQueries({ queryKey: ae }), e(t.metadata_only ? "已关闭视频预览生成" : "已开启视频预览生成");
					})
				})
			}) }),
			/* @__PURE__ */ (0, $.jsx)(ur, { disabled: !t.data || t.data.metadata_only || !!n.busy }),
			/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
				label: "抽帧解码方式",
				description: "用于生成封面、九宫格和时间轴。",
				children: /* @__PURE__ */ (0, $.jsx)("div", {
					id: "previewAccelerationSetting",
					children: /* @__PURE__ */ (0, $.jsxs)(I, {
						"aria-label": "抽帧解码方式",
						selectedKey: t.data?.preview_acceleration || "auto",
						isDisabled: i,
						onSelectionChange: (t) => {
							t !== null && n.run("preview_acceleration", (e) => W(de, { preview_acceleration: String(t) }, "POST", e), (t) => {
								q.setQueryData(ue, t), e("已保存抽帧解码方式");
							});
						},
						children: [/* @__PURE__ */ (0, $.jsx)(L, {
							id: "auto",
							children: "自动（硬件优先）"
						}), /* @__PURE__ */ (0, $.jsx)(L, {
							id: "software",
							children: "软件解码"
						})]
					})
				})
			}) }),
			n.busy ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(j, {
					role: "status",
					children: "正在保存…"
				})
			}) : null,
			r ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(C, { children: r })
			}) : null
		]
	});
}
function gr({ receipt: e }) {
	let t = X({
		queryKey: ue,
		queryFn: ({ signal: e }) => Ye(e)
	}), n = Y(), r = n.error || (t.error ? K(t.error) : "");
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "视频播放",
		children: [
			/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
				label: "转码方式",
				description: "用于播放时的视频转码。",
				children: /* @__PURE__ */ (0, $.jsx)("div", {
					id: "playbackAccelerationSetting",
					children: /* @__PURE__ */ (0, $.jsxs)(I, {
						"aria-label": "转码方式",
						selectedKey: t.data?.playback_acceleration || "auto",
						isDisabled: !t.data || t.isFetching || !!n.busy,
						onSelectionChange: (t) => {
							t !== null && n.run("playback_acceleration", (e) => W(de, { playback_acceleration: String(t) }, "POST", e), (t) => {
								q.setQueryData(ue, t), e("已保存转码方式");
							});
						},
						children: [/* @__PURE__ */ (0, $.jsx)(L, {
							id: "auto",
							children: "自动（硬件优先）"
						}), /* @__PURE__ */ (0, $.jsx)(L, {
							id: "software",
							children: "软件编解码"
						})]
					})
				})
			}) }),
			n.busy ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(j, {
					role: "status",
					children: "正在保存…"
				})
			}) : null,
			r ? /* @__PURE__ */ (0, $.jsx)(B, {
				divided: !0,
				children: /* @__PURE__ */ (0, $.jsx)(C, { children: r })
			}) : null
		]
	});
}
// src/react/boardui/components/base/textarea/textarea.tsx
var _r = pt({
	field: "relative flex w-full flex-col rounded-2lg bg-background-tertiary-default text-foreground-icon-tertiary ring-2 ring-inset ring-transparent transition-[background-color,box-shadow,color] duration-[var(--input-transition-ms)] ease",
	fieldSize: {
		medium: "p-2",
		small: "px-1.5 py-2"
	},
	textarea: "block w-full min-w-0 bg-transparent border-0 outline-none m-0 p-0 px-1 font-sans text-body-regular text-text-primary placeholder:text-text-tertiary focus:placeholder:text-text-primary disabled:text-input-disabled-text disabled:placeholder:text-input-disabled-text disabled:cursor-not-allowed aria-invalid:placeholder:text-text-error-placeholder",
	resize: {
		none: "resize-none",
		vertical: "resize-y"
	},
	footer: "flex w-full items-start justify-between gap-3",
	count: "ms-auto shrink-0 pt-px text-caption-1-medium text-text-tertiary tabular-nums"
}), vr = 20;
function yr({ size: e, rows: n = 3, autoResize: r = !1, maxRows: a, resize: o = "vertical", fieldClassName: s, className: c, ref: l, groupRef: u, onInput: d, ...f }) {
	let p = (0, Z.useContext)(Pe), m = e ?? p.size ?? "medium", h = (0, Z.useRef)(null), g = (e) => {
		h.current = e, typeof l == "function" ? l(e) : l && (l.current = e);
	}, _ = () => {
		let e = h.current;
		if (!e) return;
		if (!r) {
			e.style.height = "", e.style.maxHeight = "", e.style.overflowY = "";
			return;
		}
		let t = parseFloat(window.getComputedStyle(e).lineHeight) || vr, i = a ? a * t : Infinity;
		e.style.height = "0px";
		let o = Math.max(e.scrollHeight, n * t);
		e.style.height = `${Math.min(o, i)}px`, e.style.maxHeight = a ? `${i}px` : "", e.style.overflowY = o > i ? "auto" : "hidden";
	};
	return (0, Z.useLayoutEffect)(_), /* @__PURE__ */ (0, $.jsx)(t, {
		ref: u,
		className: ({ isFocusWithin: e, isHovered: t, isDisabled: n, isInvalid: r }) => We(_r.field, _r.fieldSize[m], t && !e && !n && !r && "ring-border-button-hover", e && !n && !r && "ring-border-button-active", n && "bg-input-disabled-background text-input-disabled-foreground", r && "bg-background-tertiary-error text-foreground-icon-error", p.fieldClassName, s),
		children: /* @__PURE__ */ (0, $.jsx)(i, {
			ref: g,
			rows: n,
			...f,
			onInput: (e) => {
				_(), d?.(e);
			},
			className: We(_r.textarea, _r.resize[r ? "none" : o], p.inputClassName, c)
		})
	});
}
yr.displayName = "TextareaBase";
function br({ label: e, hint: t, tooltip: n, placeholder: r, rows: i, autoResize: a, maxRows: o, resize: s, maxLength: c, showCount: l = !1, fieldClassName: u, ref: d, groupRef: f, className: p, value: m, defaultValue: h, onChange: g, ..._ }) {
	let [v, y] = (0, Z.useState)(() => (h ?? "").length), b = m === void 0 ? v : m.length;
	return /* @__PURE__ */ (0, $.jsx)(Ne, {
		..._,
		value: m,
		defaultValue: h,
		onChange: (e) => {
			l && m === void 0 && y(e.length), g?.(e);
		},
		className: p,
		"aria-label": _["aria-label"] ?? (!e && typeof r == "string" ? r : void 0),
		children: ({ isRequired: p, isInvalid: m }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
			e && /* @__PURE__ */ (0, $.jsx)(oe, {
				isRequired: p,
				isInvalid: m,
				tooltip: n,
				children: e
			}),
			/* @__PURE__ */ (0, $.jsx)(yr, {
				ref: d,
				groupRef: f,
				placeholder: r,
				rows: i,
				autoResize: a,
				maxRows: o,
				resize: s,
				maxLength: c,
				fieldClassName: u
			}),
			(t || l) && /* @__PURE__ */ (0, $.jsxs)("div", {
				className: _r.footer,
				children: [t && /* @__PURE__ */ (0, $.jsx)(re, {
					isInvalid: m,
					children: t
				}), l && /* @__PURE__ */ (0, $.jsx)("span", {
					className: We(_r.count, m && "text-text-error-primary"),
					children: c ? `${b}/${c}` : b
				})]
			})
		] })
	});
}
br.displayName = "Textarea";
// src/react/settings/code-pattern-settings.tsx
var xr = "^\\+{3}\\s*(?<code>FC2-PPV-\\d+)\n\\[(?<code>[A-Z]+-\\d+)\\]";
function Sr({ receipt: e }) {
	let t = X({
		queryKey: we,
		queryFn: ({ signal: e }) => Xe(e)
	}), [n, r] = (0, Z.useState)(null), i = Y(), a = n ?? (t.data?.codePatterns ?? []).join("\n"), o = i.error || (t.error ? K(t.error) : "");
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "番号识别规则",
		onSubmit: (t) => {
			t.preventDefault();
			let n = a.split("\n").map((e) => e.trim()).filter(Boolean);
			i.run("save", (e) => W(Te, { codePatterns: n }, "POST", e), (t) => {
				q.setQueryData(we, t), r(null), e("已保存配置");
			});
		},
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [/* @__PURE__ */ (0, $.jsx)(j, { children: "内置规则认不出番号时，按这里的规则从文件名里取。每行一条正则表达式，番号写在 (?<code>…) 里，没有命名组就取第一个括号。规则在下一次处理时对还没有番号的视频生效。" }), /* @__PURE__ */ (0, $.jsx)(br, {
			id: "codePatternSetting",
			"aria-label": "番号识别规则",
			rows: 3,
			autoResize: !0,
			maxRows: 12,
			spellCheck: "false",
			autoComplete: "off",
			placeholder: xr,
			value: a,
			isDisabled: !t.data,
			isInvalid: !!o,
			hint: o || void 0,
			onChange: r
		})] }), /* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
			type: "submit",
			...G(i.busy === "save"),
			children: "保存配置"
		}) })]
	});
}
// src/react/settings/password-pair.tsx
function Cr({ label: e, password: t, confirmation: n, onPassword: r, onConfirmation: i, disabled: a = !1, passwordError: o, passwordHint: s, confirmationError: c, confirmationInvalid: l = !1 }) {
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(M, {
		id: "access-password",
		type: "password",
		label: e,
		autoComplete: "new-password",
		maxLength: 256,
		value: t,
		onChange: r,
		isDisabled: a,
		isRequired: !a,
		validationBehavior: "aria",
		isInvalid: !a && !!o,
		hint: a ? s : o || s
	}), /* @__PURE__ */ (0, $.jsx)(M, {
		id: "access-confirm",
		type: "password",
		label: "确认访问密码",
		autoComplete: "new-password",
		maxLength: 256,
		value: n,
		onChange: i,
		isDisabled: a,
		isRequired: !a,
		validationBehavior: "aria",
		isInvalid: !a && (!!c || l),
		hint: a ? void 0 : c
	})] });
}
// src/react/settings/access-settings.tsx
var wr = {
	legacy: "当前使用系统生成的访问口令。改设自己的密码，或关闭登录要求。",
	locked: "访问设置无法读取，请在本机检查配置文件。",
	password: "已设置密码。新设备需要登录，登录时勾选「保持登录」可保持 30 天。"
};
function Tr({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)(""), [o, s] = (0, Z.useState)(""), [c, l] = (0, Z.useState)(""), [f, p] = (0, Z.useState)(!1), [m, h] = (0, Z.useState)({}), g = (0, Z.useRef)(null), _ = Y(), y = (e) => {
		e.preventDefault();
		let d = {};
		n.mode === "password" && !i && (d.current_password = "请输入当前访问密码"), f || ((o.length < 8 || o.length > 256) && (d.password = "访问密码需为 8–256 个字符"), o !== c && (d.confirmation = "两次输入的密码不一致")), h(d), Object.keys(d).length ? requestAnimationFrame(() => g.current?.querySelector("input[aria-invalid=\"true\"]")?.focus()) : _.run("save", (e) => W("/api/configuration/access", {
			revision: n.revision,
			action: f ? "disable" : "set",
			confirm_disable: f,
			current_password: i,
			password: f ? "" : o,
			confirmation: f ? "" : c
		}, "POST", e), (e) => {
			r(e), a(""), s(""), l(""), p(!1), h({}), t(e.mode === "open" ? "已关闭访问密码" : "已保存配置");
		}, (e) => {
			let t = e instanceof u ? e.body : null, n = t?.errors || t?.detail?.errors;
			n ? h(n) : _.setError(K(e));
		});
	}, b = wr[n.mode], x = n.mode !== "locked";
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "访问密码",
		onSubmit: y,
		children: [/* @__PURE__ */ (0, $.jsx)("div", {
			ref: g,
			children: /* @__PURE__ */ (0, $.jsxs)(B, { children: [
				b ? /* @__PURE__ */ (0, $.jsx)(j, { children: b }) : null,
				n.mode === "open" ? /* @__PURE__ */ (0, $.jsx)(N, {
					tone: "warning",
					title: "未设置访问密码",
					children: "能连接到 Peach 的设备打开地址就能看馆藏，不需要登录。"
				}) : null,
				n.mode === "password" || n.mode === "legacy" ? /* @__PURE__ */ (0, $.jsx)(v, {
					isSelected: f,
					onChange: p,
					children: "关闭访问密码"
				}) : null,
				n.mode === "password" ? /* @__PURE__ */ (0, $.jsx)(M, {
					id: "access-current",
					type: "password",
					label: "当前访问密码",
					autoComplete: "current-password",
					maxLength: 256,
					value: i,
					onChange: a,
					isRequired: !0,
					validationBehavior: "aria",
					isInvalid: !!m.current_password,
					hint: m.current_password
				}) : null,
				x && !f ? /* @__PURE__ */ (0, $.jsx)(Cr, {
					label: n.mode === "password" ? "新访问密码" : "设置访问密码",
					password: o,
					confirmation: c,
					onPassword: s,
					onConfirmation: l,
					passwordError: m.password,
					confirmationError: m.confirmation,
					passwordHint: "至少 8 个字符。保存后其他设备需要重新登录。"
				}) : null,
				f ? /* @__PURE__ */ (0, $.jsx)(N, {
					tone: "warning",
					title: "访问范围",
					children: "保存后，能连接到 Peach 的设备将直接访问馆藏。"
				}) : null,
				_.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: _.error }) : null
			] })
		}), x ? /* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
			type: "submit",
			...G(_.busy === "save"),
			children: "保存配置"
		}) }) : null]
	});
}
// src/react/components/configuration-fields.tsx
function Er({ id: e, label: t, value: n, onChange: r, options: i, isDisabled: a, isInvalid: o, children: s }) {
	let l = `${e}-label`;
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [
			/* @__PURE__ */ (0, $.jsx)(oe, {
				id: l,
				elementType: "span",
				children: t
			}),
			/* @__PURE__ */ (0, $.jsx)(De, {
				id: e,
				"aria-labelledby": l,
				orientation: "horizontal",
				className: Ce,
				value: n,
				onChange: r,
				isDisabled: a,
				isInvalid: o,
				children: i.map((e) => /* @__PURE__ */ (0, $.jsx)(c, {
					value: e.value,
					className: Se,
					children: e.label
				}, e.value))
			}),
			s
		]
	});
}
function Dr({ prefix: e, suffix: t, ...n }) {
	let r = () => /* @__PURE__ */ (0, $.jsx)("span", {
		className: "shrink-0 pr-1 text-body-regular text-text-secondary",
		children: t
	});
	return /* @__PURE__ */ (0, $.jsx)(M, {
		...n,
		leadingAddon: e ? /* @__PURE__ */ (0, $.jsx)("span", {
			className: "shrink-0 pl-1 text-body-regular text-text-secondary",
			children: e
		}) : void 0,
		trailingIcon: t ? r : void 0
	});
}
// src/react/settings/port-settings.tsx
var Or = [{
	value: "0.0.0.0",
	label: "同一局域网的设备"
}, {
	value: "127.0.0.1",
	label: "只有这台电脑"
}];
function kr({ data: e, receipt: t }) {
	let n = e.network, r = n ? n.editable : e.editable && e.port_editable !== !1, [i, a] = (0, Z.useState)(n?.host ?? "127.0.0.1"), [o, s] = (0, Z.useState)(n?.mdns_name ?? "peach"), [c, l] = (0, Z.useState)(String(e.port)), [f, p] = (0, Z.useState)({}), [m, h] = (0, Z.useState)(null), _ = Y();
	return (0, Z.useEffect)(() => {
		if (!m) return;
		let e = setTimeout(() => location.assign(m.url), En);
		return () => clearTimeout(e);
	}, [m]), m ? /* @__PURE__ */ (0, $.jsx)(F, {
		title: "访问地址",
		children: /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsxs)(N, {
			tone: "success",
			title: "配置已保存",
			children: ["Peach 正在重新启动。", /* @__PURE__ */ (0, $.jsx)(se, {
				href: m.url,
				size: "small",
				children: "返回网络与访问"
			})]
		}) })
	}) : /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "访问地址",
		onSubmit: r ? (r) => {
			r.preventDefault(), p({}), _.run("save", (t) => W(g, {
				revision: e.revision,
				media_dirs: e.media_dirs,
				...e.media_sources ? { media_sources: e.media_sources } : {},
				port: c,
				scan_now: !1,
				...n?.editable ? {
					host: i,
					...i === "0.0.0.0" ? { mdns_name: o } : {}
				} : {}
			}, "POST", t), (e) => {
				h({ url: new URL("/settings/network", e.url).href }), t("已保存配置");
			}, (e) => {
				let t = e instanceof u && e.status === 400 ? e.body?.errors : null;
				t && (t.port || t.host || t.mdns_name) ? p(t) : _.setError(K(e));
			});
		} : void 0,
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [
			n ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Ar, {
				label: "本机地址",
				value: n.local_url,
				receipt: t
			}), n.lan_url || n.ip_url ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
				/* @__PURE__ */ (0, $.jsx)(Ar, {
					label: "手机连接地址",
					value: n.lan_url || n.ip_url,
					receipt: t
				}),
				n.lan_url && n.ip_url ? /* @__PURE__ */ (0, $.jsx)(Ar, {
					label: "备用 IP 地址",
					value: n.ip_url,
					receipt: t
				}) : null,
				/* @__PURE__ */ (0, $.jsxs)(j, { children: ["手机与电脑连接同一 Wi-Fi。", n.ip_url && n.lan_url ? "名称地址打不开时，可尝试备用 IP 地址。" : ""] })
			] }) : /* @__PURE__ */ (0, $.jsx)(j, { children: n.scope === "local" ? "当前只允许这台电脑访问，手机无法连接。" : "局域网连接地址未取得，请检查电脑的网络连接和服务启动配置。" })] }) : null,
			r ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [n?.editable ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Er, {
				id: "configHost",
				label: "谁可以访问",
				value: i,
				onChange: a,
				options: Or,
				isDisabled: !!_.busy,
				isInvalid: !!f.host,
				children: f.host ? /* @__PURE__ */ (0, $.jsx)(C, { children: f.host }) : null
			}), i === "0.0.0.0" ? /* @__PURE__ */ (0, $.jsx)(Dr, {
				id: "configMdnsName",
				label: "局域网访问地址",
				value: o,
				onChange: s,
				prefix: n.local_url.startsWith("https:") ? "https://" : "http://",
				suffix: ".local",
				autoComplete: "off",
				spellCheck: "false",
				maxLength: 63,
				isDisabled: !!_.busy,
				validationBehavior: "aria",
				isInvalid: !!f.mdns_name,
				hint: f.mdns_name || void 0
			}) : null] }) : null, /* @__PURE__ */ (0, $.jsx)(Dr, {
				id: "configPort",
				label: "端口",
				prefix: "localhost:",
				inputMode: "numeric",
				value: c,
				onChange: l,
				isDisabled: !!_.busy,
				validationBehavior: "aria",
				isInvalid: !!f.port,
				hint: f.port
			})] }) : /* @__PURE__ */ (0, $.jsx)(j, { children: e.notice || "访问范围、名称与端口由服务启动配置管理。" }),
			n?.editable && i === "0.0.0.0" && n.scope === "local" ? /* @__PURE__ */ (0, $.jsx)(j, { children: "保存并重启后显示手机连接地址。可在下方设置访问密码。" }) : null,
			_.error ? /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "error",
				title: "没有保存",
				children: _.error
			}) : null
		] }), r ? /* @__PURE__ */ (0, $.jsx)(A, {
			status: "保存后 Peach 会重启，并跳转到新地址。",
			children: /* @__PURE__ */ (0, $.jsx)(d, {
				type: "submit",
				...G(_.busy === "save"),
				children: "保存配置"
			})
		}) : null]
	});
}
function Ar({ label: e, value: t, receipt: n }) {
	let r = Y();
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex min-w-0 flex-wrap items-end gap-2",
			children: [/* @__PURE__ */ (0, $.jsx)(M, {
				className: "min-w-0 flex-1",
				label: e,
				value: t,
				isReadOnly: !0,
				autoComplete: "off"
			}), /* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				"aria-label": `复制${e}`,
				onClick: () => void r.run("copy", () => navigator.clipboard.writeText(t), () => n("已复制地址")),
				children: "复制地址"
			})]
		}), r.error ? /* @__PURE__ */ (0, $.jsx)(j, {
			role: "status",
			children: "复制失败，请选中地址复制。"
		}) : null]
	});
}
// src/react/settings/peach-proxy-fields.tsx
var jr = [
	["environment", "跟随环境"],
	["direct", "直连"],
	["proxy", "自定义"]
];
function Mr({ mode: e, onChange: t, labelledBy: n }) {
	return /* @__PURE__ */ (0, $.jsx)(I, {
		"aria-label": n ? void 0 : "连接方式",
		"aria-labelledby": n,
		selectedKey: e,
		onSelectionChange: (e) => {
			e !== null && t(String(e));
		},
		children: jr.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(L, {
			id: e,
			children: t
		}, e))
	});
}
function Nr({ id: e, value: t, onChange: n, saved: r = !1, error: i }) {
	return /* @__PURE__ */ (0, $.jsx)(M, {
		id: e,
		type: "password",
		label: "代理地址",
		autoComplete: "off",
		spellCheck: "false",
		value: t,
		onChange: n,
		placeholder: r ? "已保存，留空保留" : "http://127.0.0.1:7890",
		validationBehavior: "aria",
		isInvalid: !!i,
		hint: i
	});
}
// src/react/settings/tunnel-settings.tsx
var Pr = 2e3, Fr = [["quick", "临时链接"], ["named", "命名隧道"]], Ir = {
	quick: "临时预览用，地址随机，重启后会变。启动前要先设置访问密码。",
	named: "使用你在 Cloudflare 绑定的固定域名。启动前要先设置访问密码。"
};
function Lr({ revision: e, initial: t, receipt: n }) {
	let [r, i] = (0, Z.useState)(t), [a, o] = (0, Z.useState)(e), [s, l] = (0, Z.useState)(t.mode), [f, p] = (0, Z.useState)(t.hostname), [m, g] = (0, Z.useState)(""), [_, v] = (0, Z.useState)({}), y = Y(), b = r.state === "starting" || r.state === "running", x = r.named_available && s === "named";
	(0, Z.useEffect)(() => {
		if (r.state !== "starting") return;
		let e = new AbortController(), t = window.setInterval(() => {
			Ge(e.signal).then((t) => {
				!e.signal.aborted && t.tunnel && (q.setQueryData(h, t), i(t.tunnel), o(t.revision));
			}).catch(() => void 0);
		}, Pr);
		return () => {
			e.abort(), window.clearInterval(t);
		};
	}, [r.state]);
	let S = (e, t, n) => {
		v({}), y.run(e, (e) => W("/api/configuration/tunnel", {
			revision: a,
			enabled: t,
			mode: s,
			hostname: f,
			token: m
		}, "POST", e), (e) => {
			i(e), o(e.revision), l(e.mode), p(e.hostname), g(""), n(e);
		}, (e) => {
			let t = e instanceof u ? e.body : null, n = t?.errors || t?.detail?.errors;
			n ? v(n) : y.setError(K(e));
		});
	};
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "tunnel",
		title: "Cloudflare 公网入口",
		onSubmit: (e) => {
			e.preventDefault(), S("save", b, () => n("已保存配置"));
		},
		aside: /* @__PURE__ */ (0, $.jsx)(V, {
			tone: r.error ? "error" : b ? "progress" : "neutral",
			children: r.error ? "连接失败" : r.state === "running" ? "运行中" : r.state === "starting" ? "连接中" : "已停止"
		}),
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [
			r.named_available ? /* @__PURE__ */ (0, $.jsx)(De, {
				"aria-label": "公网入口的形态（二选一）",
				value: s,
				isDisabled: b,
				onChange: (e) => l(e),
				className: Ce,
				children: Fr.map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(c, {
					value: e,
					className: Se,
					children: t
				}, e))
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(j, { children: Ir[x ? "named" : "quick"] }),
			x ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(M, {
				id: "tunnel-hostname",
				label: "公开主机名",
				autoComplete: "off",
				maxLength: 253,
				value: f,
				onChange: p,
				isDisabled: b,
				validationBehavior: "aria",
				isInvalid: !!_.hostname,
				hint: _.hostname || "Cloudflare Zero Trust 里指向这台电脑的主机名。"
			}), /* @__PURE__ */ (0, $.jsx)(M, {
				id: "tunnel-token",
				type: "password",
				label: "隧道令牌",
				autoComplete: "off",
				maxLength: 2048,
				value: m,
				onChange: g,
				isDisabled: b,
				validationBehavior: "aria",
				hint: r.token_set ? "已保存，留空不改。" : "在 Cloudflare Zero Trust 的隧道详情页复制。"
			})] }) : null,
			r.available ? null : /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "warning",
				title: "找不到 cloudflared",
				children: "安装官方 cloudflared，或用设置文件的 tunnel.binary 与 PEACH_CLOUDFLARED 指定路径。"
			}),
			r.state === "running" && r.url ? /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "info",
				title: "公网地址",
				children: /* @__PURE__ */ (0, $.jsx)(w, {
					href: r.url,
					children: r.url
				})
			}) : null,
			r.state === "starting" ? /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "info",
				title: "正在连接",
				children: "正在等待 cloudflared 连上 Cloudflare 边缘。"
			}) : null,
			r.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: r.error }) : null,
			y.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: y.error }) : null
		] }), /* @__PURE__ */ (0, $.jsxs)(A, {
			status: r.enabled ? "Peach 重启后自动恢复。" : void 0,
			children: [/* @__PURE__ */ (0, $.jsx)(d, {
				variant: r.named_available ? "secondary" : "primary",
				onClick: () => S("toggle", !b, (e) => n(e.enabled ? "公网入口已启动" : "公网入口已停止")),
				...G(y.busy === "toggle"),
				children: b ? "停止公网入口" : "启动公网入口"
			}), r.named_available ? /* @__PURE__ */ (0, $.jsx)(d, {
				type: "submit",
				...G(y.busy === "save"),
				children: "保存配置"
			}) : null]
		})]
	});
}
// src/react/settings/network-settings.tsx
function Rr({ data: e, receipt: t, panel: n, issues: r }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		...Q(n),
		children: [
			r,
			e.network || e.editable && e.port_editable !== !1 && !e.section_errors?.media_sources ? /* @__PURE__ */ (0, $.jsx)(kr, {
				data: e,
				receipt: t
			}) : null,
			e.access ? /* @__PURE__ */ (0, $.jsx)(Tr, {
				initial: e.access,
				receipt: t
			}) : null,
			e.tunnel ? /* @__PURE__ */ (0, $.jsx)(Lr, {
				revision: e.revision,
				initial: e.tunnel,
				receipt: t
			}) : null,
			e.peach_proxy ? /* @__PURE__ */ (0, $.jsx)(zr, {
				initial: e.peach_proxy,
				receipt: t
			}) : null
		]
	});
}
function zr({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e), [i, a] = (0, Z.useState)(e.mode), [o, s] = (0, Z.useState)(""), c = Y();
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		id: "peachProxy",
		title: "Peach 代理",
		onSubmit: (e) => {
			e.preventDefault(), c.run("save", (e) => W("/api/configuration/peach-proxy", {
				mode: i,
				proxy: o
			}, "POST", e), (e) => {
				r(e), s(""), t("已保存配置");
			});
		},
		children: [
			/* @__PURE__ */ (0, $.jsx)(P, { children: /* @__PURE__ */ (0, $.jsx)(R, {
				label: "连接方式",
				children: /* @__PURE__ */ (0, $.jsx)(Mr, {
					mode: i,
					onChange: a
				})
			}) }),
			i === "proxy" || n.needs_selection || c.error ? /* @__PURE__ */ (0, $.jsxs)(B, {
				divided: !0,
				children: [
					i === "proxy" ? /* @__PURE__ */ (0, $.jsx)(Nr, {
						id: "peachProxyAddress",
						value: o,
						onChange: s,
						saved: n.proxy_saved
					}) : null,
					n.needs_selection ? /* @__PURE__ */ (0, $.jsx)(N, {
						tone: "warning",
						title: "需要选择连接方式",
						children: "已有来源的代理地址不同，请选择公共连接方式。"
					}) : null,
					c.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: c.error }) : null
				]
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
				type: "submit",
				...G(c.busy === "save"),
				children: "保存配置"
			}) })
		]
	});
}
// src/react/follow-manage/credentials.tsx
var Br = "将清除这个来源在本机和共享副本中的登录凭据。", Vr = "其他系统用户可以读取此凭据文件。请在运行 Peach 的 Mac 或 Linux 电脑上，将文件权限设为仅当前用户可读写（0600）。";
function Hr(e, t) {
	return (e.shared_fields || []).includes(t) ? "来自共享，留空表示不改" : e.fields.includes(t) ? "已保存，留空表示不改" : "未填写";
}
function Ur({ row: e }) {
	if (He(e)) return /* @__PURE__ */ (0, $.jsx)(y, {
		variant: "caption",
		color: "lime",
		children: "已配置"
	});
	let t = e.requirement === "required" ? "yellow" : e.requirement === "blocked" ? "rose" : "neutral";
	return /* @__PURE__ */ (0, $.jsx)(y, {
		variant: "caption",
		color: t,
		children: _[e.requirement] || ""
	});
}
function Wr({ row: e, readOnly: t, toast: n }) {
	let [r, i] = (0, Z.useState)({}), [a, o] = (0, Z.useState)(""), s = He(e), c = _t({
		mutationFn: (t) => lt(e.provider, t),
		onSuccess: (e, t) => {
			e.note ? o(e.note) : (o(""), i({}), q.invalidateQueries({
				queryKey: E,
				exact: !0
			}), n(Object.keys(t).length ? "已保存来源凭据" : "已清除来源凭据"));
		},
		onError: (e) => o(K(e))
	}), l = () => {
		let e = Object.fromEntries(Object.entries(r).map(([e, t]) => [e, t.trim()]).filter(([, e]) => e));
		Object.keys(e).length ? c.mutate(e) : o("没有填写内容");
	};
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, $.jsxs)(j, { children: [e.why, e.where ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [" ", /* @__PURE__ */ (0, $.jsx)(w, {
				href: e.where,
				children: "获取凭据"
			})] }) : null] }),
			e.howto ? /* @__PURE__ */ (0, $.jsx)(j, { children: e.howto }) : null,
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: "flex w-full flex-col gap-3",
				children: (e.needs || []).map((n) => /* @__PURE__ */ (0, $.jsx)(M, {
					type: "password",
					label: n,
					placeholder: Hr(e, n),
					autoComplete: "off",
					spellCheck: "false",
					isDisabled: t,
					value: r[n] || "",
					onChange: (e) => i({
						...r,
						[n]: e
					}),
					className: "w-full min-w-0"
				}, n))
			}),
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [s ? /* @__PURE__ */ (0, $.jsx)(d, {
					variant: "danger",
					disabled: t,
					...G(c.isPending),
					onClick: () => void Ve({
						title: "清除来源凭据",
						body: Br,
						confirmLabel: "清除来源凭据",
						danger: !0,
						onConfirm: () => c.mutateAsync({})
					}),
					children: "清除"
				}) : null, /* @__PURE__ */ (0, $.jsx)(d, {
					variant: "primary",
					disabled: t,
					...G(c.isPending),
					onClick: l,
					children: "保存配置"
				})]
			}),
			a ? /* @__PURE__ */ (0, $.jsx)(C, { children: a }) : null,
			(e.shared_fields || []).length ? /* @__PURE__ */ (0, $.jsx)(j, { children: `${e.shared_fields.join("、")} 使用共享副本中的登录信息，本机没有单独保存。清除时，本机和共享副本中的登录信息都会删除。` }) : null,
			e.path ? /* @__PURE__ */ (0, $.jsx)(b, {
				summary: "凭据文件",
				children: /* @__PURE__ */ (0, $.jsx)(ye, {
					path: e.path,
					className: "font-mono text-caption-1-regular text-text-tertiary",
					onRevealed: n
				})
			}) : null
		]
	});
}
function Gr({ row: e, readOnly: t, toast: n }) {
	let r = /* @__PURE__ */ (0, $.jsxs)("span", {
		className: "flex min-w-0 flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, $.jsx)("span", {
				className: "inline-flex size-3.5 shrink-0 items-center justify-center",
				children: /* @__PURE__ */ (0, $.jsx)(Pt, { provider: e.provider })
			}),
			/* @__PURE__ */ (0, $.jsx)("b", {
				className: "min-w-0 text-body-medium wrap-anywhere text-text-primary",
				children: e.provider_label
			}),
			/* @__PURE__ */ (0, $.jsx)(Ur, { row: e }),
			e.missing.map((e) => /* @__PURE__ */ (0, $.jsx)(y, {
				variant: "caption",
				color: "rose",
				children: `缺 ${e}`
			}, e))
		]
	});
	return e.requirement === "none" || e.requirement === "blocked" ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-wrap items-center gap-3 border-b border-separator-border px-6 py-5 last:border-b-0 max-sm:px-4",
		children: [r, e.requirement === "blocked" ? /* @__PURE__ */ (0, $.jsx)(j, { children: e.why }) : null]
	}) : /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col gap-2 border-b border-separator-border px-6 py-5 last:border-b-0 max-sm:px-4",
		children: [
			r,
			/* @__PURE__ */ (0, $.jsx)(b, {
				summary: He(e) ? "修改凭据" : "填写凭据",
				defaultOpen: e.requirement === "required" && !He(e),
				children: /* @__PURE__ */ (0, $.jsx)(Wr, {
					row: e,
					readOnly: t,
					toast: n
				})
			}),
			e.world_readable ? /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "error",
				title: "凭据文件权限过宽",
				children: Vr
			}) : null
		]
	});
}
function Kr({ data: e, readOnly: t, toast: n, embedded: r = !1 }) {
	let i = e.providers || [], a = i.filter((e) => e.requirement === "required" && !He(e));
	if ((0, Z.useEffect)(() => {
		J("credentials", { done: i.filter(He).map((e) => e.provider) });
	}, [e]), !i.length) return /* @__PURE__ */ (0, $.jsx)(ee, {
		size: "compact",
		icon: Be,
		title: "没有可配置的来源",
		children: "已接入的站点及其凭据状态会显示在这里。"
	});
	let o = a.length ? /* @__PURE__ */ (0, $.jsx)("span", {
		className: "text-body-2-regular text-text-error-primary",
		children: `${a.length} 个待配置`
	}) : null, s = /* @__PURE__ */ (0, $.jsx)($.Fragment, { children: [
		{
			title: "可配置凭据",
			rows: i.filter((e) => e.requirement !== "none" && e.requirement !== "blocked")
		},
		{
			title: "不需要凭据",
			rows: i.filter((e) => e.requirement === "none")
		},
		{
			title: "暂不支持",
			rows: i.filter((e) => e.requirement === "blocked")
		}
	].filter((e) => e.rows.length).map((e) => /* @__PURE__ */ (0, $.jsxs)("section", {
		"aria-label": e.title,
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, $.jsx)("h4", {
			className: "text-body-medium text-text-secondary",
			children: e.title
		}), /* @__PURE__ */ (0, $.jsx)("div", {
			className: Re({
				variant: "outlined",
				padding: "none",
				className: "flex flex-col overflow-hidden"
			}),
			children: e.rows.map((e) => /* @__PURE__ */ (0, $.jsx)(Gr, {
				row: e,
				readOnly: t,
				toast: n
			}, e.provider))
		})]
	}, e.title)) });
	return r ? /* @__PURE__ */ (0, $.jsx)(F, {
		title: "来源凭据",
		aside: o || void 0,
		children: /* @__PURE__ */ (0, $.jsx)(B, { children: /* @__PURE__ */ (0, $.jsx)("div", {
			className: "flex flex-col gap-4",
			children: s
		}) })
	}) : /* @__PURE__ */ (0, $.jsxs)("div", {
		className: Re({
			padding: "none",
			className: "flex flex-col gap-4 px-6 py-5 max-sm:px-4"
		}),
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, $.jsx)("h3", {
				className: "mr-auto text-title-2-medium text-text-primary",
				children: "来源凭据"
			}), o]
		}), s]
	});
}
// src/react/settings/entry-links-settings.tsx
function qr({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e.sites), i = Y(), a = (e, t) => r((n) => n.map((n) => n.key === e ? {
		...n,
		host: t
	} : n));
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "作品资料站点",
		onSubmit: (e) => {
			e.preventDefault();
			let a = { sites: Object.fromEntries(n.map((e) => [e.key, { host: e.host }])) };
			i.run("save", (e) => W("/api/configuration/entry-links", a, "POST", e), (e) => {
				r(e.sites), t("已保存配置");
			});
		},
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [
			/* @__PURE__ */ (0, $.jsx)(j, { children: x }),
			n.map((e) => /* @__PURE__ */ (0, $.jsx)(M, {
				id: `entry-link-${e.key}`,
				label: /* @__PURE__ */ (0, $.jsx)(Ae, {
					site: e.key,
					label: `${e.label} 地址`
				}),
				autoComplete: "off",
				maxLength: 100,
				value: e.host,
				placeholder: e.default_host,
				onChange: (t) => a(e.key, t),
				validationBehavior: "aria",
				hint: S
			}, e.key)),
			i.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: i.error }) : null
		] }), /* @__PURE__ */ (0, $.jsx)(A, { children: /* @__PURE__ */ (0, $.jsx)(d, {
			type: "submit",
			...G(i.busy === "save"),
			children: "保存配置"
		}) })]
	});
}
// src/react/settings/indexer-settings.tsx
var Jr = "/api/configuration/indexers";
function Yr({ receipt: e }) {
	let t = X({
		queryKey: ["indexers"],
		queryFn: ({ signal: e }) => U(Jr, e),
		refetchOnMount: "always"
	});
	return t.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: K(t.error) }) : t.isFetching ? /* @__PURE__ */ (0, $.jsx)(Ee, {
		label: "正在读取资源搜索设置",
		html: $e
	}) : t.data ? /* @__PURE__ */ (0, $.jsx)(Qr, {
		initial: t.data,
		receipt: e
	}) : null;
}
function Xr(e) {
	try {
		return new globalThis.URL(e).host;
	} catch {
		return e;
	}
}
function Zr({ row: e, index: t }) {
	let n = [
		e.url ? Xr(e.url) : "未填地址",
		e.enabled ? "已启用" : "已停用",
		e.api_key_set && !e.clear_api_key ? "已保存 API key" : e.api_key ? "API key 待保存" : "没有 API key"
	];
	return /* @__PURE__ */ (0, $.jsxs)("span", {
		className: "flex min-w-0 items-baseline gap-3",
		children: [/* @__PURE__ */ (0, $.jsx)("span", {
			className: "shrink-0 text-text-primary",
			children: e.name || `索引器 ${t + 1}`
		}), /* @__PURE__ */ (0, $.jsx)("span", {
			className: "truncate text-body-2-regular text-text-secondary",
			children: n.join(" · ")
		})]
	});
}
function Qr({ initial: e, receipt: t }) {
	let [n, r] = (0, Z.useState)(e.indexers), i = Y();
	(0, Z.useEffect)(() => {
		J("indexers", { open: e.indexers.map((e) => !e.url) });
	}, [e]);
	let a = (e, t) => r((n) => n.map((n) => n.key === e ? {
		...n,
		...t
	} : n));
	return /* @__PURE__ */ (0, $.jsxs)(F, {
		title: "资源搜索",
		onSubmit: (e) => {
			e.preventDefault(), i.run("save", (e) => W(Jr, { indexers: n }, "POST", e), (e) => {
				r(e.indexers), t("已保存索引器");
			});
		},
		children: [/* @__PURE__ */ (0, $.jsxs)(B, { children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-4",
			children: [/* @__PURE__ */ (0, $.jsx)(b, {
				summary: "索引器连接帮助",
				children: /* @__PURE__ */ (0, $.jsxs)(j, { children: [
					"填写 Prowlarr 或 Jackett 提供的 Torznab 地址和 API key。",
					" ",
					/* @__PURE__ */ (0, $.jsx)(w, {
						href: "https://github.com/peach-mitao/peach/blob/master/docs/RESOURCE_SEARCH.md",
						children: "详细配置说明"
					})
				] })
			}), n.map((e, t) => /* @__PURE__ */ (0, $.jsx)("div", {
				className: "min-w-0 border-t border-separator-border pt-2",
				children: /* @__PURE__ */ (0, $.jsx)(b, {
					defaultOpen: !e.url,
					summary: /* @__PURE__ */ (0, $.jsx)(Zr, {
						row: e,
						index: t
					}),
					children: /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex min-w-0 flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, $.jsx)(M, {
								label: "名称",
								"aria-label": `索引器 ${t + 1} 名称`,
								value: e.name,
								maxLength: 80,
								isDisabled: !!i.busy,
								onChange: (t) => a(e.key, { name: t })
							}),
							/* @__PURE__ */ (0, $.jsx)(M, {
								label: "Torznab 地址",
								"aria-label": `索引器 ${t + 1} Torznab 地址`,
								value: e.url,
								type: "url",
								autoComplete: "off",
								placeholder: "索引器提供的 API 地址",
								isDisabled: !!i.busy,
								onChange: (t) => a(e.key, { url: t })
							}),
							/* @__PURE__ */ (0, $.jsx)(M, {
								label: "API key",
								"aria-label": `索引器 ${t + 1} API key`,
								type: "password",
								autoComplete: "new-password",
								value: e.api_key || "",
								placeholder: e.api_key_set ? "已保存，留空不改" : void 0,
								isDisabled: !!i.busy,
								onChange: (t) => a(e.key, { api_key: t })
							}),
							/* @__PURE__ */ (0, $.jsxs)("div", {
								className: "flex flex-wrap items-center gap-x-6 gap-y-2",
								children: [
									/* @__PURE__ */ (0, $.jsx)(v, {
										isSelected: e.enabled,
										isDisabled: !!i.busy,
										onChange: (t) => a(e.key, { enabled: t }),
										children: "启用"
									}),
									e.api_key_set ? /* @__PURE__ */ (0, $.jsx)(v, {
										isSelected: !!e.clear_api_key,
										isDisabled: !!i.busy,
										onChange: (t) => a(e.key, { clear_api_key: t }),
										children: "清除已保存的 API key"
									}) : null,
									/* @__PURE__ */ (0, $.jsx)(d, {
										variant: "danger",
										type: "button",
										size: "small",
										disabled: !!i.busy,
										"aria-label": `移除索引器 ${t + 1}`,
										onClick: () => r(n.filter((t) => t.key !== e.key)),
										children: "移除"
									})
								]
							})
						]
					})
				})
			}, e.key))]
		}), i.error ? /* @__PURE__ */ (0, $.jsx)(C, { children: i.error }) : null] }), /* @__PURE__ */ (0, $.jsxs)(A, { children: [/* @__PURE__ */ (0, $.jsx)(d, {
			variant: "secondary",
			type: "button",
			disabled: !!i.busy || n.length >= e.max_indexers,
			onClick: () => r([...n, {
				key: ot(),
				name: "",
				url: "",
				enabled: !0,
				api_key_set: !1
			}]),
			children: "添加索引器"
		}), /* @__PURE__ */ (0, $.jsx)(d, {
			type: "submit",
			...G(i.busy === "save"),
			children: "保存配置"
		})] })]
	});
}
// src/react/settings/source-settings.tsx
function $r({ data: e, receipt: t, panel: n, issues: r }) {
	let i = X({
		queryKey: E,
		queryFn: ({ signal: e }) => Ke(e),
		enabled: n?.active !== !1,
		refetchOnMount: "always"
	});
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		...Q(n),
		children: [
			r,
			/* @__PURE__ */ (0, $.jsx)("div", { children: /* @__PURE__ */ (0, $.jsx)(f, {
				href: "/sources",
				variant: "secondary",
				children: "采集来源与登录状态"
			}) }),
			i.data ? /* @__PURE__ */ (0, $.jsx)(Kr, {
				data: i.data,
				readOnly: !!e.ledger_read_only,
				toast: t,
				embedded: !0
			}) : i.error ? /* @__PURE__ */ (0, $.jsx)(N, {
				tone: "error",
				title: "来源凭据未取得",
				children: K(i.error)
			}) : n?.active === !1 ? null : /* @__PURE__ */ (0, $.jsx)(Ee, {
				label: "正在读取来源凭据",
				html: Ue
			}),
			/* @__PURE__ */ (0, $.jsx)(dr, { receipt: t }),
			/* @__PURE__ */ (0, $.jsx)(Yr, { receipt: t }),
			e.entry_links ? /* @__PURE__ */ (0, $.jsx)(qr, {
				initial: e.entry_links,
				receipt: t
			}) : null
		]
	});
}
// src/react/settings/configuration-shape.ts
function ei(e) {
	let t = e.downloads;
	if (!t) return null;
	let n = t.media_sources ?? [];
	return {
		cloud: n.some((e) => p.includes(e)),
		has115: n.includes("115"),
		pikpak: n.includes("pikpak"),
		pikpakRoots: t.pikpak_roots.length > 0,
		pikpakLoggedIn: t.pikpak.logged_in,
		browserLogin: t.pikpak_browser.available
	};
}
function ti(e) {
	let t = e.tunnel;
	return {
		port: !!(e.editable && e.port_editable !== !1),
		addresses: e.network ? 1 + Number(!!(e.network.lan_url || e.network.ip_url)) + Number(!!(e.network.lan_url && e.network.ip_url)) : 0,
		networkEditable: !!e.network?.editable,
		lan: e.network?.host === "0.0.0.0",
		proxyAddress: e.peach_proxy?.mode === "proxy" || !!e.peach_proxy?.needs_selection,
		access: e.access?.mode ?? "",
		tunnelNamed: !!t?.named_available,
		tunnelNamedMode: !!(t?.named_available && t.mode === "named"),
		tunnelNote: !!(t && (!t.available || t.state === "starting" || t.state === "running" && t.url))
	};
}
function ni(e) {
	let t = e.updates, n = e.update_job?.state ?? "idle", r = !t || t.state === "unchecked" && !t.checked_at && n === "idle", i = +!!t?.package_kind + (r ? 0 : +!!t?.checked_at + (t?.state === "unchecked" ? 0 : 1) + (n === "idle" ? 0 : 1)), a = e.automatic_updates, o = e.storage;
	return {
		releaseFacts: t?.package_kind ? 5 : 4,
		releaseNotes: i,
		autoUpdateHelp: !(!a || a.available && !a.download_available),
		startupNote: !!e.startup?.message,
		desktopNote: !!e.startup?.desktop_message,
		storageRows: o?.usage?.categories.length ?? 0,
		storageNotes: o && !o.relocation.available ? 1 : 0,
		reporting: !!e.remote_reporting,
		reportingIdle: !(!e.remote_reporting || e.remote_reporting.available),
		sharing: !!e.library_sharing,
		sharingNotice: !!e.library_sharing?.notice,
		sharingIdle: !(!e.library_sharing || e.library_sharing.available),
		facts: e.facts.map((e) => e.term),
		uninstall: !!e.uninstall,
		uninstallHelp: !!e.uninstall?.available
	};
}
// src/react/settings/configuration-page.tsx
function ri({ receipt: e, reopenTutorial: t, section: n = "", diagnostics: r }) {
	let i = X({
		queryKey: h,
		queryFn: ({ signal: e }) => Ge(e)
	}), a = i.data;
	return a ? /* @__PURE__ */ (0, $.jsx)(oi, {
		data: a,
		receipt: e,
		reopenTutorial: t,
		section: n,
		diagnostics: r,
		refreshing: i.isFetching,
		reload: () => {
			i.refetch({ cancelRefetch: !1 });
		}
	}) : /* @__PURE__ */ (0, $.jsx)("div", {
		className: "ui-configpage",
		children: /* @__PURE__ */ (0, $.jsx)(N, {
			tone: "error",
			title: "配置读取失败",
			children: i.error ? K(i.error) : "未取得配置，请刷新页面重试。"
		})
	});
}
function ii({ data: e, sections: t, reload: n, refreshing: r }) {
	return /* @__PURE__ */ (0, $.jsx)($.Fragment, { children: t.map((t) => {
		let i = e.section_errors?.[t];
		return i ? /* @__PURE__ */ (0, $.jsx)(N, {
			tone: "error",
			title: i.title,
			action: /* @__PURE__ */ (0, $.jsx)(d, {
				variant: "secondary",
				size: "small",
				onClick: n,
				...G(r),
				children: "重新读取"
			}),
			children: i.message
		}, t) : null;
	}) });
}
var ai = 0;
function oi({ data: e, receipt: t, reopenTutorial: n, section: r, diagnostics: i, reload: a, refreshing: o }) {
	let [s] = (0, Z.useState)(() => `board-tabs-${++ai}`), [c, l] = (0, Z.useState)(r), u = (0, Z.useRef)(null), d = (0, Z.useRef)(c);
	(0, Z.useEffect)(() => {
		l(r);
	}, [r]), (0, Z.useEffect)(() => {
		let t = ei(e);
		t && J("downloads", t), J("network", ti(e)), J("maintenance", ni(e));
	}, [e]), (0, Z.useLayoutEffect)(() => {
		if (d.current === c) return;
		d.current = c;
		let e = u.current?.querySelector("[role=\"tablist\"]"), t = u.current?.querySelector(".ui-board-group-active");
		if (!e || !t) return;
		let n = parseFloat(getComputedStyle(e).top);
		if (!Number.isFinite(n) || e.getBoundingClientRect().top > n + 1) return;
		let r = matchMedia("(max-width:900px)").matches ? e.getBoundingClientRect().bottom + 8 : n;
		window.scrollTo(0, Math.max(0, window.scrollY + t.getBoundingClientRect().top - r));
	}, [c]);
	let f = (e) => {
		l(e), ft(dt(e), {
			replace: !0,
			state: rt.navigation.location.state
		});
	}, [p, m] = (0, Z.useState)(() => matchMedia("(max-width:900px)").matches);
	(0, Z.useEffect)(() => {
		let e = matchMedia("(max-width:900px)"), t = () => m(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let h = (0, Z.useRef)([]), g = {
		data: e,
		receipt: t
	}, _ = (t) => /* @__PURE__ */ (0, $.jsx)(ii, {
		data: e,
		sections: t,
		reload: a,
		refreshing: o
	}), v = [
		"peach_proxy",
		"access",
		"tunnel",
		"push_discovery",
		...e.editable && e.port_editable !== !1 ? ["media_sources"] : []
	], y = !!(e.peach_proxy || e.access || e.tunnel || e.editable && e.port_editable !== !1 || v.some((t) => e.section_errors?.[t])), b = e.downloads, x = [
		{
			title: "媒体库与入库",
			body: (n) => /* @__PURE__ */ (0, $.jsxs)("div", {
				...Q(n),
				children: [
					_([
						"media_sources",
						"library_count",
						"mount_dependencies"
					]),
					!e.section_errors?.media_sources && !e.section_errors?.library_count ? /* @__PURE__ */ (0, $.jsx)(ar, { ...g }) : null,
					/* @__PURE__ */ (0, $.jsx)(Sr, { receipt: t }),
					/* @__PURE__ */ (0, $.jsx)(hr, { receipt: t })
				]
			})
		},
		{
			title: "来源与订阅",
			body: (e) => /* @__PURE__ */ (0, $.jsx)($r, {
				...g,
				panel: e,
				issues: _(["entry_links"])
			})
		},
		...b || e.section_errors?.downloads ? [{
			title: "下载渠道",
			body: (e) => /* @__PURE__ */ (0, $.jsx)(Xt, {
				initial: b,
				receipt: t,
				panel: e,
				issues: _(["downloads"])
			})
		}] : [],
		...y ? [{
			title: "网络与访问",
			body: (e) => /* @__PURE__ */ (0, $.jsx)(Rr, {
				...g,
				panel: e,
				issues: _(v)
			})
		}] : [],
		{
			title: "应用与维护",
			body: (e) => /* @__PURE__ */ (0, $.jsxs)("div", {
				...Q(e),
				children: [
					_([
						"startup",
						"uninstall",
						"storage",
						"remote_reporting",
						"library_sharing",
						"updates",
						"update_job",
						"automatic_updates",
						"facts"
					]),
					/* @__PURE__ */ (0, $.jsx)(wn, { ...g }),
					/* @__PURE__ */ (0, $.jsx)(gr, { receipt: t }),
					/* @__PURE__ */ (0, $.jsx)(pn, {
						...g,
						reopenTutorial: n
					})
				]
			})
		},
		{
			title: "系统诊断",
			body: (e) => /* @__PURE__ */ (0, $.jsx)("div", {
				...Q(e),
				children: e.active ? i : null
			})
		}
	], S = Math.max(0, x.findIndex((e) => e.title === c)), ee = (e, t) => {
		let n = x.length - 1, r;
		if (e.key === "ArrowRight" || e.key === "ArrowDown") r = t === n ? 0 : t + 1;
		else if (e.key === "ArrowLeft" || e.key === "ArrowUp") r = t === 0 ? n : t - 1;
		else if (e.key === "Home") r = 0;
		else if (e.key === "End") r = n;
		else return;
		e.preventDefault(), f(x[r].title), h.current[r]?.focus();
	};
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		ref: u,
		className: "ui-configpage",
		children: [/* @__PURE__ */ (0, $.jsx)(be, {
			className: "ui-board-local-nav",
			role: "tablist",
			"aria-label": "配置分区",
			"data-section-nav": "",
			"data-section-items": "",
			"data-pill-nav": "",
			"aria-orientation": p ? "horizontal" : "vertical",
			children: x.map(({ title: e }, t) => /* @__PURE__ */ (0, $.jsx)("button", {
				ref: (e) => {
					h.current[t] = e;
				},
				type: "button",
				role: "tab",
				id: `${s}-tab-${t}`,
				"aria-controls": `${s}-panel-${t}-0`,
				"aria-selected": t === S,
				"data-pill-selected": t === S ? "" : void 0,
				"data-pill-variant": "gray",
				tabIndex: t === S ? 0 : -1,
				onClick: () => f(e),
				onKeyDown: (e) => ee(e, t),
				children: e
			}, e))
		}), x.map(({ title: e, body: t }, n) => /* @__PURE__ */ (0, $.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("h2", {
			className: "ui-configgroup",
			children: e
		}), t({
			index: n,
			id: `${s}-panel-${n}-0`,
			labelledBy: `${s}-tab-${n}`,
			active: n === S
		})] }, e))]
	});
}
export { ri as ConfigurationPage };

//# debugId=6fdcae45-fda4-4a59-8633-a78cc41397a6