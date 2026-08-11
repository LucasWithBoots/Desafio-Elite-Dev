import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CreditCard,
  MapPin,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Seat } from "@/entities/seat/model";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { checkoutService } from "@/features/checkout/services/checkoutService";
import { useEvent } from "@/features/event-catalog/hooks/useEvent";
import { useEventSeats } from "@/features/event-catalog/hooks/useEventSeats";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath, routes } from "@/shared/constants/routes";
import { formatCurrency, formatDateTime } from "@/shared/lib/formatters";

type CheckoutStep = "seats" | "payment";
type PaymentMethod = "approved" | "declined";

const paymentMethods: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "approved",
    label: "Pagamento aprovado",
    description: "Emite o ingresso",
    icon: CreditCard,
  },
  {
    id: "declined",
    label: "Pagamento negado",
    description: "Cancela a reserva",
    icon: X,
  },
];

export function CheckoutPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CheckoutStep>("seats");
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("approved");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { data: event, isLoading: isEventLoading } = useEvent(eventId);
  const { data: seats = [], isLoading: isSeatsLoading } = useEventSeats(eventId);

  const isSeatMap = event?.seatingMode === "seat-map";
  const selectedSeats = useMemo(
    () =>
      seats
        .filter((seat) => selectedSeatIds.includes(seat.id))
        .sort(compareSeats),
    [seats, selectedSeatIds],
  );
  const seatRows = useMemo(() => groupSeatsByRow(seats), [seats]);
  const ticketCount = isSeatMap ? selectedSeats.length : quantity;
  const total = event ? event.price * ticketCount : 0;
  const canContinue = isSeatMap ? selectedSeats.length > 0 : quantity > 0;

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!event) {
        throw new Error("Evento nao encontrado");
      }

      const approved = paymentMethod === "approved";

      if (event.seatingMode === "seat-map") {
        if (!selectedSeatIds.length) {
          throw new Error("Selecione ao menos um assento.");
        }

        const purchasedTickets = [];

        for (const seatId of selectedSeatIds) {
          const reservation = await checkoutService.createReservation({
            eventId: event.id,
            seatId,
            quantity: 1,
          });
          const result = await checkoutService.simulatePayment({
            reservationId: reservation.id,
            approved,
          });

          if (approved && !result.ticket) {
            throw new Error("Nao foi possivel emitir um dos ingressos.");
          }

          if (result.ticket) {
            purchasedTickets.push(result.ticket);
          }
        }

        return { approved, tickets: purchasedTickets };
      }

      const reservation = await checkoutService.createReservation({
        eventId: event.id,
        quantity,
      });
      const result = await checkoutService.simulatePayment({
        reservationId: reservation.id,
        approved,
      });

      if (approved && !result.ticket) {
        throw new Error("Nao foi possivel emitir o ingresso.");
      }

      return { approved, tickets: result.ticket ? [result.ticket] : [] };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["events", eventId, "seats"] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });

      if (!result.approved) {
        setSelectedSeatIds([]);
        setFeedback("Pagamento negado. A reserva foi cancelada e os ingressos voltaram a ficar disponiveis.");
        return;
      }

      navigate(routes.checkoutSuccess, {
        state: {
          ticketCount: result.tickets.length,
        },
      });
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel finalizar a compra.");
    },
  });

  if (isEventLoading || isSeatsLoading) {
    return <LoadingState />;
  }

  if (!event) {
    return (
      <EmptyState
        title="Evento nao encontrado"
        description="Volte para os eventos publicados e tente novamente."
      />
    );
  }

  const currentEvent = event;

  function toggleSeat(seat: Seat) {
    if (seat.status === "sold" || seat.status === "reserved") {
      return;
    }

    setFeedback(null);
    setSelectedSeatIds((currentSeats) =>
      currentSeats.includes(seat.id)
        ? currentSeats.filter((seatId) => seatId !== seat.id)
        : [...currentSeats, seat.id],
    );
  }

  function removeSeat(seatId: string) {
    setSelectedSeatIds((currentSeats) =>
      currentSeats.filter((selectedSeatId) => selectedSeatId !== seatId),
    );
  }

  function handleBack() {
    if (step === "payment") {
      setStep("seats");
      return;
    }

    navigate(eventDetailsPath(currentEvent.id));
  }

  return (
    <section className="app-screen checkout-screen checkout-flow-screen">
      <header className="checkout-mobile-header">
        <button className="round-action" type="button" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <strong>{step === "seats" ? getSectionLabel(currentEvent.venueName) : "Checkout"}</strong>
        <Link className="round-action" to={eventDetailsPath(currentEvent.id)} aria-label="Fechar">
          <X size={18} aria-hidden="true" />
        </Link>
      </header>

      {step === "seats" ? (
        <>
          {isSeatMap ? (
            <section className="seat-selection-panel" aria-labelledby="seat-selection-title">
              <h1 id="seat-selection-title">Escolha seus assentos</h1>
              <div className="seat-legend" aria-label="Legenda dos assentos">
                <span><i className="legend-selected" /> Selecionado</span>
                <span><i className="legend-available" /> Disponivel</span>
                <span><i className="legend-occupied" /> Ocupado</span>
              </div>

              <div className="seat-map-board">
                <span className="seat-row-heading">Filas</span>
                {seatRows.map(({ row, seats: rowSeats }) => (
                  <div
                    className="seat-map-row"
                    key={row}
                    style={{ "--seat-count": rowSeats.length } as CSSProperties}
                  >
                    <span className="seat-row-label">{row}</span>
                    {rowSeats.map((seat) => {
                      const occupied = seat.status === "sold" || seat.status === "reserved";
                      const selected = selectedSeatIds.includes(seat.id);

                      return (
                        <button
                          className={`seat-dot ${selected ? "seat-dot-selected" : ""} ${
                            occupied ? "seat-dot-occupied" : ""
                          }`}
                          disabled={occupied || paymentMutation.isPending}
                          key={seat.id}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`Assento ${seat.label}`}
                          onClick={() => toggleSeat(seat)}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="seat-selection-panel" aria-labelledby="seat-selection-title">
              <h1 id="seat-selection-title">Escolha a quantidade</h1>
              <div className="quantity-picker checkout-quantity-picker" aria-label="Quantidade de ingressos">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                >
                  -
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(current + 1, currentEvent.availableTickets))
                  }
                  disabled={quantity >= currentEvent.availableTickets}
                >
                  +
                </button>
              </div>
            </section>
          )}

          <TicketSelectionSummary
            currency={currentEvent.currency}
            price={currentEvent.price}
            selectedSeats={selectedSeats}
            ticketCount={ticketCount}
            onRemoveSeat={removeSeat}
          />

          <div className="checkout-bottom-bar">
            <div>
              <span>Total</span>
              <strong>{formatCurrency(total, currentEvent.currency)}</strong>
            </div>
            <button
              className="app-primary-action"
              type="button"
              disabled={!canContinue}
              onClick={() => setStep("payment")}
            >
              Continuar
            </button>
          </div>
        </>
      ) : (
        <>
          <section className="checkout-event-summary">
            {currentEvent.imageUrl ? <img src={currentEvent.imageUrl} alt="" /> : null}
            <div>
              <strong>{currentEvent.title}</strong>
              <span>{currentEvent.venueName}</span>
              <span>{formatDateTime(currentEvent.startsAt)}</span>
            </div>
          </section>

          <TicketSelectionSummary
            currency={currentEvent.currency}
            price={currentEvent.price}
            selectedSeats={selectedSeats}
            ticketCount={ticketCount}
            onRemoveSeat={removeSeat}
          />

          <section className="checkout-personal-info" aria-labelledby="personal-info-title">
            <h2 id="personal-info-title">Informacoes pessoais</h2>
            <label className="checkout-readonly-field">
              Nome completo
              <input readOnly aria-readonly="true" value={session?.user.name ?? ""} />
            </label>
            <label className="checkout-readonly-field">
              Email
              <input readOnly aria-readonly="true" value={session?.user.email ?? ""} />
            </label>
          </section>

          <section className="checkout-payment-methods" aria-labelledby="payment-title">
            <h2 id="payment-title">Escolha seu metodo de pagamento</h2>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const selected = paymentMethod === method.id;

              return (
                <button
                  className={`checkout-payment-method ${selected ? "checkout-payment-method-active" : ""}`}
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>
                    <strong>{method.label}</strong>
                    <small>{method.description}</small>
                  </span>
                  {selected ? <Check size={17} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </section>

          <div className="checkout-bottom-bar">
            <div>
              <span>Total</span>
              <strong>{formatCurrency(total, currentEvent.currency)}</strong>
            </div>
            <button
              className="app-primary-action"
              type="button"
              disabled={!canContinue || paymentMutation.isPending}
              onClick={() => paymentMutation.mutate()}
            >
              {paymentMutation.isPending ? "Processando..." : "Simular pagamento"}
            </button>
          </div>

          {feedback ? <p className="form-feedback checkout-feedback">{feedback}</p> : null}
        </>
      )}
    </section>
  );
}

interface TicketSelectionSummaryProps {
  currency: string;
  price: number;
  selectedSeats: Seat[];
  ticketCount: number;
  onRemoveSeat: (seatId: string) => void;
}

function TicketSelectionSummary({
  currency,
  price,
  selectedSeats,
  ticketCount,
  onRemoveSeat,
}: TicketSelectionSummaryProps) {
  const generalAdmissionRows = Array.from({ length: selectedSeats.length ? 0 : ticketCount });

  return (
    <section className="selected-ticket-panel" aria-labelledby="selected-ticket-title">
      <h2 id="selected-ticket-title">Seus ingressos</h2>
      <div className="selected-ticket-list">
        {selectedSeats.map((seat) => (
          <article className="selected-ticket-row" key={seat.id}>
            <span>
              <small>Setor</small>
              Principal
            </span>
            <span>
              <small>Fila</small>
              {seat.row}
            </span>
            <span>
              <small>Assento</small>
              {seat.number}
            </span>
            <span>
              <small>Valor</small>
              {formatCurrency(price, currency)}
            </span>
            <button type="button" aria-label={`Remover assento ${seat.label}`} onClick={() => onRemoveSeat(seat.id)}>
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </article>
        ))}

        {generalAdmissionRows.map((_, index) => (
          <article className="selected-ticket-row selected-ticket-row-general" key={index}>
            <span>
              <small>Tipo</small>
              Entrada
            </span>
            <span>
              <small>Ingresso</small>
              {index + 1}
            </span>
            <span>
              <small>Valor</small>
              {formatCurrency(price, currency)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function groupSeatsByRow(seats: Seat[]) {
  const rows = new Map<string, Seat[]>();

  seats.forEach((seat) => {
    rows.set(seat.row, [...(rows.get(seat.row) ?? []), seat]);
  });

  return Array.from(rows.entries())
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort(compareSeats),
    }))
    .sort((first, second) => first.row.localeCompare(second.row, "pt-BR", { numeric: true }));
}

function compareSeats(first: Seat, second: Seat) {
  return (
    first.row.localeCompare(second.row, "pt-BR", { numeric: true }) ||
    first.number - second.number
  );
}

function getSectionLabel(venueName: string) {
  return venueName.length > 18 ? "Escolha de assentos" : venueName;
}
