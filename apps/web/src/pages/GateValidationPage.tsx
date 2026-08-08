import { Keyboard, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export function GateValidationPage() {
  return (
    <section className="gate-layout">
      <div className="page-heading">
        <span className="eyebrow">Portaria</span>
        <h1>Validar ingresso</h1>
        <p>Tela mobile/tablet first para leitura por camera e digitacao manual.</p>
      </div>

      <div className="scanner-panel">
        <QrCode size={120} aria-hidden="true" />
        <strong>Scanner de QR Code</strong>
        <p>Quando a camera for integrada, a leitura cai diretamente na validacao do back-end.</p>
        <Button>
          <ShieldCheck size={18} aria-hidden="true" />
          Simular ingresso valido
        </Button>
      </div>

      <form className="manual-code-panel">
        <Input label="Codigo manual" name="ticketCode" placeholder="ELITE-TCK-DEMO-2026" />
        <Button variant="secondary">
          <Keyboard size={18} aria-hidden="true" />
          Validar codigo
        </Button>
      </form>
    </section>
  );
}
