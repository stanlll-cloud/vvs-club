// 从与 SVG 同源的矢量路径渲染 1024px 应用图标。
import AppKit
let size = 1024
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
let transform = NSAffineTransform()
transform.scale(by: 2)
transform.translateX(by: 0, yBy: 512)
transform.scaleX(by: 1, yBy: -1)
transform.concat()
let tile = NSBezierPath(roundedRect: NSRect(x: 32, y: 32, width: 448, height: 448), xRadius: 104, yRadius: 104)
NSGradient(colors: [NSColor(white: 0.27, alpha: 1), NSColor(white: 0.09, alpha: 1), NSColor(white: 0.035, alpha: 1)])!.draw(in: tile, angle: 65)
NSColor(white: 0.50, alpha: 1).setStroke()
tile.lineWidth = 2
tile.stroke()
func polygon(_ points: [(CGFloat, CGFloat)]) {
    let path = NSBezierPath()
    path.move(to: NSPoint(x: points[0].0, y: points[0].1))
    for point in points.dropFirst() { path.line(to: NSPoint(x: point.0, y: point.1)) }
    path.close()
    NSColor(calibratedRed: 245/255, green: 245/255, blue: 247/255, alpha: 1).setFill()
    path.fill()
}
polygon([(116,166),(177,166),(243,333),(309,166),(370,166),(270,370),(215,370)])
polygon([(347,260),(347,336),(404,298)])
NSGraphicsContext.restoreGraphicsState()
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
