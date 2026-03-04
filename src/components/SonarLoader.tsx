'use client';

import { useEffect, useRef } from 'react';

export default function SonarLoader({ size = 200 }: { size?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const scale = size / 600;

        const centerDotRadius = 20 * scale;
        const innerSolidWidth = 59 * scale;
        const innerEmptyWidth = 20 * scale;
        const middleSolidWidth = 40 * scale;
        const outerEmptyWidth = 20 * scale;
        const outerSolidWidth = 59 * scale;
        const blipEmptyRadius = 30 * scale;
        const blipRedRadius = 10 * scale;
        const sweepLineWidth = 20 * scale;
        const sweepLineInner = 10 * scale;
        const sweepLineOuter = 240 * scale;

        const ring1Center = centerDotRadius + innerSolidWidth + (innerEmptyWidth / 2);
        const ring2Center = centerDotRadius + innerSolidWidth + innerEmptyWidth + middleSolidWidth + (outerEmptyWidth / 2);
        const maxRadius = centerDotRadius + innerSolidWidth + innerEmptyWidth + middleSolidWidth + outerEmptyWidth + outerSolidWidth;

        class Blip {
            angle: number;
            dist: number;
            hitRatio: number;

            constructor(angle: number, dist: number) {
                this.angle = angle;
                this.dist = dist;
                this.hitRatio = 0;
            }
        }

        const blips = [
            new Blip(225 * Math.PI / 180, ring2Center),
            new Blip(45 * Math.PI / 180, ring1Center),
            new Blip(110 * Math.PI / 180, ring2Center)
        ];

        let sweepAngle = -45 * Math.PI / 180;
        let animationFrameId: number;
        let lastTime: number | null = null;

        function draw(time: number) {
            if (!ctx) return;
            if (lastTime === null) lastTime = time;
            const deltaTime = time - lastTime;
            lastTime = time;

            const computedStyle = getComputedStyle(document.documentElement);
            const accentColor = computedStyle.getPropertyValue('--color-accent').trim() || '#c99b33';
            const bgColor = computedStyle.getPropertyValue('--color-sidebar').trim() || '#2c3e3c';

            ctx.clearRect(0, 0, width, height);
            ctx.save();

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
            ctx.fill();

            const trailLength = Math.PI * 0.85;
            const slices = 60;
            for (let i = 0; i < slices; i++) {
                const sliceAngle = trailLength / slices;
                const start = sweepAngle - trailLength + (i * sliceAngle);
                const end = start + sliceAngle + 0.015;

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, maxRadius, start, end);
                ctx.closePath();

                const opacity = (i / slices) * 0.35;
                ctx.globalAlpha = opacity;
                ctx.fillStyle = accentColor;
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.strokeStyle = 'rgba(0,0,0,1)';

            ctx.beginPath();
            ctx.arc(cx, cy, centerDotRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.lineWidth = innerEmptyWidth;
            ctx.beginPath();
            ctx.arc(cx, cy, ring1Center, 0, Math.PI * 2);
            ctx.stroke();

            ctx.lineWidth = outerEmptyWidth;
            ctx.beginPath();
            ctx.arc(cx, cy, ring2Center, 0, Math.PI * 2);
            ctx.stroke();

            ctx.lineWidth = sweepLineWidth;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(sweepAngle) * sweepLineInner, cy + Math.sin(sweepAngle) * sweepLineInner);
            ctx.lineTo(cx + Math.cos(sweepAngle) * sweepLineOuter, cy + Math.sin(sweepAngle) * sweepLineOuter);
            ctx.stroke();

            blips.forEach(blip => {
                const bx = cx + Math.cos(blip.angle) * blip.dist;
                const by = cy + Math.sin(blip.angle) * blip.dist;
                ctx.beginPath();
                ctx.arc(bx, by, blipEmptyRadius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'source-over';

            blips.forEach(blip => {
                let diff = (sweepAngle - blip.angle) % (Math.PI * 2);
                if (diff < 0) diff += Math.PI * 2;

                if (diff < 0.2) {
                    blip.hitRatio = 1.0;
                }

                if (blip.hitRatio > 0) {
                    // Decay gradually so the pulse fades nicely over roughly 500ms
                    blip.hitRatio -= 0.03 * (deltaTime / 16.6);
                    if (blip.hitRatio < 0) blip.hitRatio = 0;
                }

                const bx = cx + Math.cos(blip.angle) * blip.dist;
                const by = cy + Math.sin(blip.angle) * blip.dist;

                ctx.beginPath();
                ctx.arc(bx, by, blipRedRadius, 0, Math.PI * 2);
                ctx.fillStyle = accentColor;
                ctx.fill();

                if (blip.hitRatio > 0) {
                    ctx.beginPath();
                    const currentPulse = blipRedRadius + ((blipEmptyRadius - blipRedRadius) * (1 - blip.hitRatio));
                    ctx.arc(bx, by, currentPulse, 0, Math.PI * 2);
                    ctx.globalAlpha = blip.hitRatio * 0.5;
                    ctx.fillStyle = accentColor;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(bx, by, blipRedRadius + 8 * scale, 0, Math.PI * 2);
                    ctx.globalAlpha = blip.hitRatio * 0.7;
                    ctx.fillStyle = accentColor;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
            });

            ctx.restore();

            // 1 full rotation per second = 2 * PI radians per 1000ms
            const speedPerMs = (2 * Math.PI) / 1000;
            sweepAngle += speedPerMs * deltaTime;
            if (sweepAngle > Math.PI * 2) sweepAngle -= Math.PI * 2;

            animationFrameId = requestAnimationFrame(draw);
        }

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [size]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="block max-w-full"
            style={{ width: size, height: size }}
        />
    );
}
