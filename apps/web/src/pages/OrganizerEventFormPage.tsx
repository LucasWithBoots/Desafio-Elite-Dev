import { Search } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

export function OrganizerEventFormPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Organizador</span>
        <h1>Criar evento</h1>
        <p>Dois caminhos: buscar na Ticketmaster ou cadastrar manualmente quando o catalogo nao resolver.</p>
      </div>

      <div className="form-layout">
        <section className="panel">
          <h2>Buscar no catalogo</h2>
          <Input label="Nome do evento" name="keyword" placeholder="Ex.: Coldplay, teatro, festival" />
          <Button>
            <Search size={18} aria-hidden="true" />
            Buscar na Ticketmaster
          </Button>
        </section>

        <section className="panel">
          <h2>Criar manualmente</h2>
          <Input label="Titulo" name="title" placeholder="Nome do evento" />
          <Input label="Local" name="venueName" placeholder="Nome do local" />
          <Input label="Data" name="date" type="date" />
          <Input label="Horario" name="time" type="time" />
          <Input label="Preco" name="price" type="number" min="0" />
          <Button>Salvar rascunho</Button>
        </section>
      </div>
    </section>
  );
}
