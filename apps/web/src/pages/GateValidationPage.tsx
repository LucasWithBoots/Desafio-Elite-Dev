import { useMutation } from "@tanstack/react-query";
import { Keyboard, QrCode, ShieldCheck, TriangleAlert } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gateValidationService } from "@/features/gate-validation/services/gateValidationService";
import type { GateValidationResult } from "@/features/gate-validation/types";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";

type BarcodeDetectorInstance = {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

export function GateValidationPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<GateValidationResult | null>(null);
  const [cameraFeedback, setCameraFeedback] = useState<string | null>(null);

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

  useEffect(() => stopCamera, []);

  function validateCode(qrPayload: string) {
    if (!qrPayload.trim()) {
      return;
    }

    validationMutation.mutate({ qrPayload: qrPayload.trim() });
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    validateCode(manualCode);
  }

  async function startCameraScanner() {
    const Detector = (
      window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }
    ).BarcodeDetector;

    if (!Detector) {
      setCameraFeedback("Este navegador nao oferece leitura nativa de QR. Use o codigo manual.");
      return;
    }

    try {
      setCameraFeedback("Aponte a camera para o QR Code.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new Detector({ formats: ["qr_code"] });
      const scan = async () => {
        if (!videoRef.current || validationMutation.isPending) {
          return;
        }

        const codes = await detector.detect(videoRef.current);
        const code = codes[0]?.rawValue;

        if (code) {
          setManualCode(code);
          validateCode(code);
          stopCamera();
          return;
        }

        scanTimerRef.current = window.setTimeout(scan, 500);
      };

      scan();
    } catch {
      setCameraFeedback("Nao foi possivel acessar a camera. Use o codigo manual.");
      stopCamera();
    }
  }

  function stopCamera() {
    if (scanTimerRef.current) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

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
            <video ref={videoRef} muted playsInline aria-label="Camera para leitura de QR" />
            <QrCode size={130} aria-hidden="true" />
            <span />
            <span />
            <span />
            <span />
          </div>
          <strong>Scanner de QR Code</strong>
          <p>{cameraFeedback ?? "A leitura sempre passa pelo back-end antes de liberar entrada."}</p>
          <Button onClick={startCameraScanner} disabled={validationMutation.isPending}>
            <ShieldCheck size={18} aria-hidden="true" />
            Ler pela camera
          </Button>
        </section>

        <form className="manual-code-panel" onSubmit={handleManualSubmit}>
          <Input
            label="Codigo manual"
            name="ticketCode"
            placeholder="ELITE:TICKET:..."
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
          />
          <Button variant="secondary" disabled={validationMutation.isPending}>
            <Keyboard size={18} aria-hidden="true" />
            {validationMutation.isPending ? "Validando..." : "Validar codigo"}
          </Button>
        </form>
      </div>

      {result ? (
        <section className="validation-result-grid" aria-label="Resultado da validacao">
          <article className={`validation-state validation-state-${result.status}`}>
            {result.status === "valid" ? (
              <ShieldCheck size={18} aria-hidden="true" />
            ) : (
              <TriangleAlert size={18} aria-hidden="true" />
            )}
            <strong>{getValidationTitle(result.status)}</strong>
            <span>{result.message}</span>
          </article>
          {result.ticket ? (
            <article className="validation-state">
              <QrCode size={18} aria-hidden="true" />
              <strong>{result.ticket.event?.title ?? "Ingresso"}</strong>
              <span>{result.ticket.seat?.label ?? "Entrada geral"}</span>
            </article>
          ) : (
            <article className="validation-state">
              <TriangleAlert size={18} aria-hidden="true" />
              <strong>Sem ingresso</strong>
              <span>Confira o codigo informado.</span>
            </article>
          )}
        </section>
      ) : (
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
      )}

      <Link className="text-link gate-login-link" to={routes.login}>
        Trocar perfil de acesso
      </Link>
    </section>
  );
}

function getValidationTitle(status: GateValidationResult["status"]) {
  const titles = {
    valid: "Valido",
    invalid: "Invalido",
    "already-used": "Ja usado",
    "wrong-event": "Evento errado",
  } as const;

  return titles[status];
}
