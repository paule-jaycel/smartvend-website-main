import { createFileRoute } from "@tanstack/react-router";
import { CarMeetRegistration } from "../components/site/CarMeetRegistration";

export const Route = createFileRoute("/car-meet-registration")({
  head: () => ({
    meta: [
      { title: "VINFAST X CleanIt - Registration" },
      {
        name: "description",
        content: "Register for VINFAST X CleanIt.",
      },
      { property: "og:title", content: "VINFAST X CleanIt - Registration" },
      {
        property: "og:description",
        content: "Register for VINFAST X CleanIt.",
      },
    ],
  }),
  component: CarMeetRegistration,
});
