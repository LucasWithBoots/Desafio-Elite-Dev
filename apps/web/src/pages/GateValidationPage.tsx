import { useMutation } from "@tanstack/react-query";
import type { IScannerControls } from "@zxing/browser";
import {
  Camera,
  ImageUp,
  Keyboard,
  QrCode,
  ShieldCheck,
  Square,
  TicketCheck,
  TriangleAlert,
} from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gateValidationService } from "@/features/gate-validation/services/gateValidationService";
import type { GateValidationResult } from "@/features/gate-validation/types";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";

type ValidationMode = "qr" | "manual";
type CameraStatus = "idle" | "starting" | "scanning";

export function GateValidationPage() {
  const [validationMode, setValidationMode] = useState<ValidationMode>("qr");
  const [qrPayload, setQrPayload] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<GateValidationResult | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraFeedback, setCameraFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const scanHandledRef = useRef(false);

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

  const stopCamera = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setCameraStatus("idle");
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  async function startCamera() {
    stopCamera();
    setResult(null);
    setCameraFeedback(null);
    scanHandledRef.current = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraFeedback(
        "A camera precisa de HTTPS ou localhost. Use uma imagem ou o codigo manual.",
      );
      return;
    }

    if (!videoRef.current) {
      return;
    }

    setCameraStatus("starting");

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      scannerControlsRef.current = await reader.decodeFromConstraints(
        {
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        },
        videoRef.current,
        (decodedResult, _error, controls) => {
          if (!decodedResult || scanHandledRef.current) {
            return;
          }

          scanHandledRef.current = true;
          const decodedPayload = decodedResult.getText();
          setQrPayload(decodedPayload);
          setCameraFeedback("QR Code lido. Validando ingresso...");
          controls.stop();
          scannerControlsRef.current = null;
          setCameraStatus("idle");
          validationMutation.mutate({ qrPayload: decodedPayload });
        },
      );
      setCameraStatus("scanning");
    } catch {
      stopCamera();
      setCameraFeedback(
        "Nao foi possivel acessar a camera. Confira a permissao ou envie uma imagem.",
      );
    }
  }

  async function handleQrImage(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!file) {
      return;
    }

    stopCamera();
    setResult(null);
    setCameraFeedback("Lendo QR Code da imagem...");
    const imageUrl = URL.createObjectURL(file);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const decodedResult = await reader.decodeFromImageUrl(imageUrl);
      const decodedPayload = decodedResult.getText();
      setQrPayload(decodedPayload);
      setCameraFeedback("QR Code encontrado. Validando ingresso...");
      validationMutation.mutate({ qrPayload: decodedPayload });
    } catch {
      setCameraFeedback("Nenhum QR Code valido foi encontrado nessa imagem.");
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  function changeValidationMode(mode: ValidationMode) {
    if (mode === "manual") {
      stopCamera();
    }

    setValidationMode(mode);
    setCameraFeedback(null);
  }

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
          <div className={`scanner-frame scanner-frame-${cameraStatus}`}>
            <video ref={videoRef} muted playsInline aria-label="Imagem da camera" />
            {cameraStatus === "idle" ? (
              <div className="scanner-placeholder" aria-hidden="true">
                <QrCode size={96} />
                <span>Aponte a camera para o QR Code</span>
              </div>
            ) : null}
            {cameraStatus === "starting" ? (
              <span className="scanner-starting">Abrindo camera...</span>
            ) : null}
            <i className="scanner-corner scanner-corner-top-left" />
            <i className="scanner-corner scanner-corner-top-right" />
            <i className="scanner-corner scanner-corner-bottom-left" />
            <i className="scanner-corner scanner-corner-bottom-right" />
          </div>
          <div>
            <strong>Leitura de ingresso</strong>
            <p>A validacao consulta o back-end e marca o ingresso como lido.</p>
          </div>

          <div className="gate-mode-toggle" aria-label="Tipo de validacao">
            <button
              className={validationMode === "qr" ? "gate-mode-button active" : "gate-mode-button"}
              type="button"
              onClick={() => changeValidationMode("qr")}
            >
              <QrCode size={18} aria-hidden="true" />
              QR Code
            </button>
            <button
              className={
                validationMode === "manual" ? "gate-mode-button active" : "gate-mode-button"
              }
              type="button"
              onClick={() => changeValidationMode("manual")}
            >
              <Keyboard size={18} aria-hidden="true" />
              Codigo manual
            </button>
          </div>

          {validationMode === "qr" ? (
            <form className="gate-code-form" onSubmit={handleQrSubmit}>
              <div className="gate-camera-actions">
                <Button
                  type="button"
                  onClick={cameraStatus === "idle" ? startCamera : stopCamera}
                >
                  {cameraStatus === "idle" ? (
                    <Camera size={18} aria-hidden="true" />
                  ) : (
                    <Square size={17} aria-hidden="true" />
                  )}
                  {cameraStatus === "idle" ? "Usar camera" : "Parar camera"}
                </Button>
                <label className="button button-secondary gate-image-button">
                  <ImageUp size={18} aria-hidden="true" />
                  Ler imagem
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrImage}
                    aria-label="Selecionar imagem com QR Code"
                  />
                </label>
              </div>
              {cameraFeedback ? (
                <p className="gate-camera-feedback" role="status">
                  {cameraFeedback}
                </p>
              ) : null}
              <label className="field gate-code-field" htmlFor="qrPayload">
                <span>Ou cole o conteudo do QR Code</span>
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
