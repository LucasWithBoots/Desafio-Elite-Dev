import { useMutation } from "@tanstack/react-query";
import { Keyboard, QrCode, ShieldCheck, TicketCheck, TriangleAlert } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { gateValidationService } from "@/features/gate-validation/services/gateValidationService";
import type { GateValidationResult } from "@/features/gate-validation/types";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";

type ValidationMode = "qr" | "manual";

export function GateValidationPage() {
  const [validationMode, setValidationMode] = useState<ValidationMode>("qr");
  const [qrPayload, setQrPayload] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<GateValidationResult | null>(null);

  const validationMutation = useMutation({
    mutationFn: gateValidationService.validateTicket,
    onSuccess: setResult,
    onError: (error) => {
      setResult({
        status: "invalid",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel validar o ingresso.",
      });
    },
  });

  function validateQrCode() {
    const normalizedPayload = qrPayload.trim();

    if (!normalizedPayload) {
      return;
    }

    validationMutation.mutate({ qrPayload: normalizedPayload });
  }

  function validateManualCode() {
    const normalizedManualCode = manualCode.trim();

    if (!normalizedManualCode) {
      return;
    }

    validationMutation.mutate({ manualCode: normalizedManualCode });
  }

  function handleQrSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    validateQrCode();
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    validateManualCode();
  }

  return (
    <section className="app-screen gate-screen">
      <header className="lime-page-header">
        <span className="eyebrow">Portaria</span>
        <h1>Validar ingresso</h1>
        <p>Valide pelo conteudo do QR Code ou pelo codigo manual do ingresso.</p>
      </header>

      <div className="gate-grid">
        <section className="scanner-panel gate-reader-panel">
          <div className="scanner-frame">
            <QrCode size={130} aria-hidden="true" />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>Leitura de ingresso</strong>
            <p>A validacao consulta o back-end e marca o ingresso como lido.</p>
          </div>

          <div className="gate-mode-toggle" aria-label="Tipo de validacao">
            <button
              className={validationMode === "qr" ? "gate-mode-button active" : "gate-mode-button"}
              type="button"
              onClick={() => setValidationMode("qr")}
            >
              <QrCode size={18} aria-hidden="true" />
              QR Code
            </button>
            <button
              className={
                validationMode === "manual" ? "gate-mode-button active" : "gate-mode-button"
              }
              type="button"
              onClick={() => setValidationMode("manual")}
            >
              <Keyboard size={18} aria-hidden="true" />
              Codigo manual
            </button>
          </div>

          {validationMode === "qr" ? (
            <form className="gate-code-form" onSubmit={handleQrSubmit}>
              <label className="field gate-code-field" htmlFor="qrPayload">
                <span>Conteudo do QR Code</span>
                <textarea
                  id="qrPayload"
                  name="qrPayload"
                  placeholder="ELITE:TICKET:..."
                  value={qrPayload}
                  onChange={(event) => setQrPayload(event.target.value)}
                />
              </label>
              <Button disabled={validationMutation.isPending}>
                <ShieldCheck size={18} aria-hidden="true" />
                {validationMutation.isPending ? "Validando..." : "Validar QR Code"}
              </Button>
            </form>
          ) : (
            <form className="gate-code-form" onSubmit={handleManualSubmit}>
              <Input
                label="Codigo manual"
                name="ticketCode"
                placeholder="Ex.: DEMO ou 550E8400"
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
              />
              <Button variant="secondary" disabled={validationMutation.isPending}>
                <TicketCheck size={18} aria-hidden="true" />
                {validationMutation.isPending ? "Validando..." : "Validar codigo"}
              </Button>
            </form>
          )}
        </section>
      </div>

      <section
        className={`gate-result-card gate-result-${result?.status ?? "idle"}`}
        aria-label="Resultado da validacao"
      >
        <div className="gate-result-status">
          {result ? getValidationIcon(result.status) : <QrCode size={24} aria-hidden="true" />}
          <span>Resultado</span>
          <strong>{result ? getValidationTitle(result.status) : "Aguardando leitura"}</strong>
          <p>{result?.message ?? "Informe o QR Code ou codigo manual para consultar o ingresso."}</p>
        </div>

        {result?.ticket ? (
          <div className="gate-ticket-summary">
            <strong>{result.ticket.event?.title ?? "Ingresso"}</strong>
            <span>{result.ticket.event?.venueName ?? "Local nao informado"}</span>
            <span>{result.ticket.seat?.label ?? "Entrada geral"}</span>
            {result.ticket.validatedAt ? (
              <span>Lido em {formatValidationDate(result.ticket.validatedAt)}</span>
            ) : null}
          </div>
        ) : null}
      </section>

      <Link className="text-link gate-login-link" to={routes.login}>
        Trocar perfil de acesso
      </Link>
    </section>
  );
}

function getValidationTitle(status: GateValidationResult["status"]) {
  const titles = {
    valid: "QR Code valido",
    invalid: "QR Code invalido",
    "already-used": "QR Code ja foi lido",
    "wrong-event": "Evento incorreto",
  } as const;

  return titles[status];
}

function getValidationIcon(status: GateValidationResult["status"]) {
  if (status === "valid") {
    return <ShieldCheck size={24} aria-hidden="true" />;
  }

  if (status === "already-used") {
    return <TicketCheck size={24} aria-hidden="true" />;
  }

  return <TriangleAlert size={24} aria-hidden="true" />;
}

function formatValidationDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
