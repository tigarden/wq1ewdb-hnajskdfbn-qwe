Add-Type -AssemblyName System.Drawing

function Generate-AppIcon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Dark background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 8, 11, 18))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    $bgBrush.Dispose()

    # Center glowing squircle badge
    $badgeMargin = [int]($size * 0.12)
    $badgeSize = $size - 2 * $badgeMargin
    $badgeRect = New-Object System.Drawing.Rectangle($badgeMargin, $badgeMargin, $badgeSize, $badgeSize)
    $radius = [int]($size * 0.20)
    
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc($badgeRect.X, $badgeRect.Y, $d, $d, 180, 90)
    $path.AddArc($badgeRect.Right - $d, $badgeRect.Y, $d, $d, 270, 90)
    $path.AddArc($badgeRect.Right - $d, $badgeRect.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($badgeRect.X, $badgeRect.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    $badgeBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $badgeRect,
        [System.Drawing.Color]::FromArgb(255, 37, 99, 235),
        [System.Drawing.Color]::FromArgb(255, 29, 78, 216),
        45.0
    )
    $g.FillPath($badgeBrush, $path)
    $badgeBrush.Dispose()

    # Badge border outline
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 96, 165, 250), [float]($size * 0.015))
    $g.DrawPath($borderPen, $path)
    $borderPen.Dispose()
    $path.Dispose()

    # Inner document/ledger shape
    $docW = [int]($size * 0.38)
    $docH = [int]($size * 0.48)
    $docX = [int](($size - $docW) / 2)
    $docY = [int](($size - $docH) / 2)
    $docRadius = [int]($size * 0.05)

    $docPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $docD = $docRadius * 2
    $docPath.AddArc($docX, $docY, $docD, $docD, 180, 90)
    $docPath.AddArc($docX + $docW - $docD, $docY, $docD, $docD, 270, 90)
    $docPath.AddArc($docX + $docW - $docD, $docY + $docH - $docD, $docD, $docD, 0, 90)
    $docPath.AddArc($docX, $docY + $docH - $docD, $docD, $docD, 90, 90)
    $docPath.CloseFigure()

    # Draw document outline
    $docPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]($size * 0.038))
    $docPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $docPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawPath($docPen, $docPath)
    $docPath.Dispose()

    # Draw ledger lines inside document
    $lineMargin = [int]($docW * 0.22)
    $lineX1 = $docX + $lineMargin
    $lineX2 = $docX + $docW - $lineMargin
    $lineY1 = $docY + [int]($docH * 0.26)
    $lineY2 = $docY + [int]($docH * 0.46)
    $lineY3 = $docY + [int]($docH * 0.66)
    $lineY4 = $docY + [int]($docH * 0.82)

    $g.DrawLine($docPen, $lineX1, $lineY1, $lineX2, $lineY1)
    $g.DrawLine($docPen, $lineX1, $lineY2, $lineX2, $lineY2)
    
    # 3rd line shorter with cyan accent
    $accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 56, 189, 248), [float]($size * 0.038))
    $accentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $accentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($accentPen, $lineX1, $lineY3, [int]($lineX1 + ($lineX2 - $lineX1) * 0.58), $lineY3)
    $g.DrawLine($docPen, $lineX1, $lineY4, $lineX2, $lineY4)

    $docPen.Dispose()
    $accentPen.Dispose()

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Success: generated $outputPath (${size}x${size})"
}

Generate-AppIcon 180 "public\apple-touch-icon.png"
Generate-AppIcon 192 "public\icon-192.png"
Generate-AppIcon 512 "public\icon-512.png"
