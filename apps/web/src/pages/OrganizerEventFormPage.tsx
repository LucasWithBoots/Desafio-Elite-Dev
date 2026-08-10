import { CalendarDays, ImagePlus, MapPin, Search } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export function OrganizerEventFormPage() {
  return (
    <section className="app-screen organizer-form-screen">
      <header className="blue-page-header">
        <span className="eyebrow">Organizador</span>
        <h1>Criar evento</h1>
        <p>Busque na Ticketmaster ou crie manualmente quando o catalogo nao resolver.</p>
      </header>

      <div className="form-layout">
        <section className="panel catalog-panel">
          <span className="panel-icon">
            <Search size={20} aria-hidden="true" />
          </span>
          <h2>Buscar no catalogo</h2>
          <Input label="Nome do evento" name="keyword" placeholder="Ex.: Coldplay, teatro, festival" />
          <Button>
            <Search size={18} aria-hidden="true" />
            Buscar na Ticketmaster
          </Button>
        </section>

        <section className="panel manual-event-panel">
          <span className="panel-icon">
            <ImagePlus size={20} aria-hidden="true" />
          </span>
          <h2>Criar manualmente</h2>
          <Input label="Titulo" name="title" placeholder="Nome do evento" />
          <Input label="Local" name="venueName" placeholder="Nome do local" />
          <div className="inline-form-grid">
            <span>
              <CalendarDays size={16} aria-hidden="true" />
              Data e horario
            </span>
            <span>
              <MapPin size={16} aria-hidden="true" />
              Localizacao
            </span>
          </div>
          <Input label="Data" name="date" type="date" />
          <Input label="Horario" name="time" type="time" />
          <Input label="Preco" name="price" type="number" min="0" />
          <Button>Salvar rascunho</Button>
        </section>
      </div>
    </section>
  );
}
