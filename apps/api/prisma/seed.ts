import {
  EventStatus,
  PaymentStatus,
  PrismaClient,
  ReservationStatus,
  SeatStatus,
  SeatingMode,
  TicketStatus,
  UserRole,
} from "@prisma/client";
import { hashPassword } from "../src/modules/auth/password.js";
import {
  createTicketPayload,
  hashTicketPayload,
} from "../src/modules/tickets/codes.js";

const prisma = new PrismaClient();

const demoPassword = "123456";
const organizerId = "usr_organizer_demo";
const customerId = "usr_customer_demo";
const customerTwoId = "usr_customer_two_demo";
const gateUserId = "usr_gate_demo";

const eventSeeds = [
  {
    id: "evt_rock-night",
    title: "Neon Brush",
    description:
      "Pinte no escuro em uma noite imersiva com musica, luzes e experiencias ao vivo.",
    about:
      "Neon Brush e uma experiencia criativa para quem quer sair da rotina e viver uma noite diferente. O encontro mistura pintura guiada, luz negra, musica ambiente e uma atmosfera de festa intimista para voce criar sua propria obra enquanto aproveita o evento. Nao precisa ter experiencia previa: a proposta e relaxar, experimentar cores, conhecer pessoas e levar para casa uma lembranca visual da noite.",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-11-02T21:00:00.000-03:00",
    venueName: "Novotel Music City",
    address: "Av. Principal, 1000",
    city: "Sao Paulo",
    price: 120,
    capacity: 120,
    seatingMode: SeatingMode.SEAT_MAP,
    category: "Workshops",
    genre: "Art",
    externalSource: "ticketmaster",
    externalId: "tm_rock-night",
  },
  {
    id: "evt_indie-session",
    title: "Glass House",
    description:
      "Festival visual com artistas independentes, instalacoes e apresentacoes curtas.",
    about:
      "Glass House reune artistas independentes, instalacoes visuais e apresentacoes curtas em um formato facil de explorar. A programacao foi pensada para circular sem pressa entre ambientes, descobrir novos criadores e acompanhar pequenas performances ao longo da noite.",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-12-12T19:30:00.000-03:00",
    venueName: "Teatro Luz",
    address: "Rua das Flores, 48",
    city: "Sao Paulo",
    price: 86,
    capacity: 80,
    seatingMode: SeatingMode.SEAT_MAP,
    category: "Festivals",
    genre: "Music",
    externalSource: "manual",
  },
  {
    id: "evt-ballet-dawn",
    title: "Dawn Ballet",
    description:
      "Espetaculo de ballet contemporaneo com sessao unica e assentos numerados.",
    about:
      "Dawn Ballet apresenta uma leitura contemporanea do ballet classico, combinando movimento, luz e trilha sonora em uma sessao unica. A experiencia foi desenhada para valorizar a proximidade com o palco e a escolha do assento, por isso os ingressos sao numerados.",
    imageUrl:
      "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-12-20T20:00:00.000-03:00",
    venueName: "Theatro Municipal",
    address: "Praca Ramos de Azevedo",
    city: "Sao Paulo",
    price: 98,
    capacity: 140,
    seatingMode: SeatingMode.SEAT_MAP,
    category: "Ballet",
    genre: "Dance",
    externalSource: "ticketmaster",
    externalId: "tm_ballet-dawn",
  },
  {
    id: "evt-van-gogh-immersive",
    title: "Van Gogh: Experiencia Imersiva",
    description: "Projecoes em grande escala, trilha sonora e salas sensoriais.",
    about:
      "Van Gogh: Experiencia Imersiva transforma pinturas, cartas e referencias do artista em ambientes de grande escala. As salas combinam projecoes, som e percursos sensoriais para criar uma visita mais emocional do que uma exposicao tradicional.",
    imageUrl:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-11-11T20:00:00.000-03:00",
    venueName: "Utopia Gallery",
    address: "Rua Harmonia, 220",
    city: "Sao Paulo",
    price: 64,
    capacity: 160,
    seatingMode: SeatingMode.GENERAL_ADMISSION,
    category: "Art",
    genre: "Immersive",
    externalSource: "manual",
  },
  {
    id: "evt-climbing-center",
    title: "Climbing & Bouldering Center",
    description: "Aula experimental e pista aberta para familias e iniciantes.",
    about:
      "Climbing & Bouldering Center e uma atividade para quem quer experimentar escalada em um ambiente controlado e acompanhado. A sessao inclui orientacao inicial, aquecimento e tempo livre nas paredes de bouldering.",
    imageUrl:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-11-13T09:00:00.000-03:00",
    venueName: "Center Munich North",
    address: "Rua Norte, 890",
    city: "Sao Paulo",
    price: 42,
    capacity: 90,
    seatingMode: SeatingMode.GENERAL_ADMISSION,
    category: "Kids & Family",
    genre: "Sport",
    externalSource: "ticketmaster",
    externalId: "tm_climbing-center",
  },
  {
    id: "evt-titanic-immersive",
    title: "Titanic: The Immersive Exhibition",
    description: "Exposicao imersiva com cenarios, artefatos e audio guia.",
    about:
      "Titanic: The Immersive Exhibition combina cenarios, relatos historicos, artefatos e audio guia para reconstruir momentos marcantes da viagem. A visita alterna informacao, ambientacao e recursos visuais para criar uma narrativa facil de acompanhar.",
    imageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-11-14T14:00:00.000-03:00",
    venueName: "Pokeptoshallo",
    address: "Av. das Artes, 1440",
    city: "Sao Paulo",
    price: 52,
    capacity: 200,
    seatingMode: SeatingMode.GENERAL_ADMISSION,
    category: "Theatre",
    genre: "History",
    externalSource: "manual",
  },
];

function toCents(value: number) {
  return Math.round(value * 100);
}

function makeSeatId(eventId: string, row: string, number: number) {
  return `seat_${eventId}_${row}_${number}`;
}

function makeSeats(eventId: string, capacity: number) {
  const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const seatsPerRow = 10;

  return Array.from({ length: capacity }, (_, index) => {
    const row = rows[Math.floor(index / seatsPerRow)] ?? `R${index}`;
    const number = (index % seatsPerRow) + 1;

    return {
      id: makeSeatId(eventId, row, number),
      eventId,
      row,
      number,
      label: `${row}${number}`,
      status: SeatStatus.AVAILABLE,
    };
  });
}

async function main() {
  const passwordHash = hashPassword(demoPassword);

  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: organizerId,
        name: "Organizador Demo",
        email: "organizador@elite.dev",
        passwordHash,
        role: UserRole.ORGANIZER,
      },
      {
        id: customerId,
        name: "Cliente Demo",
        email: "cliente@elite.dev",
        passwordHash,
        role: UserRole.CUSTOMER,
      },
      {
        id: customerTwoId,
        name: "Cliente Dois",
        email: "cliente2@elite.dev",
        passwordHash,
        role: UserRole.CUSTOMER,
      },
      {
        id: gateUserId,
        name: "Portaria Demo",
        email: "portaria@elite.dev",
        passwordHash,
        role: UserRole.GATE,
      },
    ],
  });

  await prisma.event.createMany({
    data: eventSeeds.map(({ price, ...event }) => ({
      ...event,
      organizerId,
      startsAt: new Date(event.startsAt),
      priceCents: toCents(price),
      currency: "BRL",
      status: EventStatus.PUBLISHED,
    })),
  });

  const seatMapEvents = eventSeeds.filter(
    (event) => event.seatingMode === SeatingMode.SEAT_MAP,
  );

  await prisma.seat.createMany({
    data: seatMapEvents.flatMap((event) => makeSeats(event.id, event.capacity)),
  });

  const demoSeatId = makeSeatId("evt_rock-night", "A", 1);
  const demoTicketPayload = createTicketPayload(
    "tck_demo",
    "evt_rock-night",
    "usr_customer_demo",
  );

  await prisma.seat.update({
    where: { id: demoSeatId },
    data: { status: SeatStatus.SOLD },
  });

  await prisma.reservation.create({
    data: {
      id: "res_demo_ticket",
      eventId: "evt_rock-night",
      customerId,
      seatId: demoSeatId,
      quantity: 1,
      status: ReservationStatus.CONFIRMED,
    },
  });

  await prisma.payment.create({
    data: {
      id: "pay_demo_ticket",
      reservationId: "res_demo_ticket",
      amountCents: toCents(120),
      currency: "BRL",
      status: PaymentStatus.APPROVED,
    },
  });

  await prisma.ticket.create({
    data: {
      id: "tck_demo",
      eventId: "evt_rock-night",
      customerId,
      reservationId: "res_demo_ticket",
      seatId: demoSeatId,
      codeHash: hashTicketPayload(demoTicketPayload),
      qrPayload: demoTicketPayload,
      shareSlug: "demo-neon-brush-ticket",
      status: TicketStatus.ACTIVE,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Database seeded with demo data.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
