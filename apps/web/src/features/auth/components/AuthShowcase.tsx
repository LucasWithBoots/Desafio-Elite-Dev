import { Bookmark } from "lucide-react";

const showcaseEvents = [
  {
    className: "auth-event-card-left",
    title: "Coldplay",
    venue: "Allianz Parque",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
  },
  {
    className: "auth-event-card-right",
    title: "Taylor Swift",
    venue: "Music Stadium",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  },
  {
    className: "auth-event-card-main",
    title: "Lady Gaga: The MAYHEM Ball",
    venue: "Uber Arena",
    imageUrl:
      "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&w=900&q=80",
  },
];

export function AuthShowcase() {
  return (
    <div className="auth-showcase" aria-hidden="true">
      {showcaseEvents.map((event) => (
        <article className={`auth-event-card ${event.className}`} key={event.title}>
          <img src={event.imageUrl} alt="" />
          <span className="auth-card-save">
            <Bookmark size={15} />
          </span>
          <div>
            <strong>{event.title}</strong>
            <span>{event.venue}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
