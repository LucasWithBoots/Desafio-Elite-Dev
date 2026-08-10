import { Keyboard, QrCode, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export function GateValidationPage() {
  return (
    <section className="app-screen gate-screen">
      <header className="lime-page-header">
        <span className="eyebrow">Portaria</span>
        <h1>Validar ingresso</h1>
        <p>Leia o QR Code ou use o codigo manual quando a camera falhar.</p>
      </header>

      <div className="gate-grid">
        <section className="scanner-panel">
          <div className="scanner-frame">
            <QrCode size={130} aria-hidden="true" />
            <span />
            <span />
            <span />
            <span />
          </div>
          <strong>Scanner de QR Code</strong>
          <p>A leitura sempre passa pelo back-end antes de liberar entrada.</p>
          <Button>
            <ShieldCheck size={18} aria-hidden="true" />
            Simular ingresso valido
          </Button>
        </section>

        <form className="manual-code-panel">
          <Input label="Codigo manual" name="ticketCode" placeholder="ELITE-TCK-DEMO-2026" />
          <Button variant="secondary">
            <Keyboard size={18} aria-hidden="true" />
            Validar codigo
          </Button>
        </form>
      </div>

      <section className="validation-result-grid" aria-label="Estados de validacao">
        <article className="validation-state validation-state-valid">
          <ShieldCheck size={18} aria-hidden="true" />
          <strong>Valido</strong>
          <span>Entrada liberada</span>
        </article>
        <article className="validation-state">
          <TriangleAlert size={18} aria-hidden="true" />
          <strong>Ja usado</strong>
          <span>Bloquear reentrada</span>
        </article>
      </section>
    </section>
  );
}
