export class DebugColliderView {

    constructor(ctx) {
        this.ctx = ctx;
        this.enabled = true;   // Activar / desactivar debugging
    }

    drawCollider(entity) {
        if (!this.enabled) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.lineWidth = 2;
        
        switch (entity.colliderType) {

            case "rect":
                ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
                ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
                break;

            case "circle":
                ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
                ctx.beginPath();
                ctx.arc(
                    entity.x + entity.width / 2,
                    entity.y + entity.height / 2,
                    entity.width / 2,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
                break;

            case "ellipse":
                ctx.strokeStyle = "rgba(0, 150, 255, 0.8)";
                ctx.beginPath();
                ctx.ellipse(
                    entity.x + entity.width / 2,
                    entity.y + entity.height / 2,
                    entity.width / 2,
                    entity.height / 2,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
                break;
        }

        ctx.restore();
    }
}
