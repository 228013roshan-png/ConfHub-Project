import { Request, Response } from "express";
import { getDbState, saveDbState } from "../services/dbService";
import { Conference, TicketTier } from "../types";

export class ConferenceController {
  /**
   * POST /api/conferences
   * Create a new conference
   */
  static createConference(req: Request, res: Response) {
    const { title, date, venue, deadline, ticketTiers, studentPrice, regularPrice, internationalPrice } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Title and Date are required." });
    }

    const state = getDbState();
    const confId = `conf-${Date.now()}`;

    // Construct dynamic ticket tiers or generate defaults
    const defaultTiers: TicketTier[] = Array.isArray(ticketTiers) && ticketTiers.length > 0
      ? ticketTiers
      : [
          {
            id: `tier-${Date.now()}-student`,
            name: "Student Scholar Pass",
            price: Number(studentPrice) || 1500,
            currency: "NPR",
            description: "Subsidized pass for research students with institutional ID.",
            features: [
              "Access to all technical sessions & poster tracks",
              "Digital certificate of participation",
              "Conference kit & symposium proceedings booklet",
              "Lunch & refreshment passes"
            ],
            recommendedGateway: "eSewa",
            badgeText: "Student Special",
            isPopular: false
          },
          {
            id: `tier-${Date.now()}-pro`,
            name: "Professional & Faculty Pass",
            price: Number(regularPrice) || 3500,
            currency: "NPR",
            description: "Standard registration for university professors, research scholars, and industry delegates.",
            features: [
              "Full access to keynote addresses & plenary panels",
              "Indexed manuscript proceedings download",
              "Gala dinner networking reception",
              "Printed delegate kit & official badge"
            ],
            recommendedGateway: "Khalti",
            badgeText: "Most Popular",
            isPopular: true
          },
          {
            id: `tier-${Date.now()}-intl`,
            name: "International Delegate Pass",
            price: Number(internationalPrice) || 50,
            currency: "USD",
            description: "Full conference & symposium access for overseas participants and foreign delegates.",
            features: [
              "Full 3-day access to all events & workshops",
              "Kathmandu Heritage cultural exchange reception",
              "International author tax receipt & certificate",
              "VIP networking banquet table"
            ],
            recommendedGateway: "Stripe",
            badgeText: "Global Access",
            isPopular: false
          }
        ];

    const newConf: Conference = {
      id: confId,
      title,
      date,
      venue: venue || "Kathmandu, Nepal",
      deadline: deadline || "2026-12-31",
      status: "Active",
      ticketTiers: defaultTiers,
    };

    state.conferences.push(newConf);
    saveDbState(state);

    return res.status(201).json(newConf);
  }

  /**
   * PUT /api/conferences/:id/pricing
   * Update dynamic ticket tiers & pricing for a conference
   */
  static updateConferencePricing(req: Request, res: Response) {
    const { id } = req.params;
    const { ticketTiers } = req.body;

    if (!Array.isArray(ticketTiers)) {
      return res.status(400).json({ error: "ticketTiers must be an array." });
    }

    const state = getDbState();
    const confIndex = state.conferences.findIndex((c) => c.id === id);

    if (confIndex === -1) {
      return res.status(404).json({ error: "Conference not found." });
    }

    state.conferences[confIndex].ticketTiers = ticketTiers;
    saveDbState(state);

    return res.json({
      message: "Conference pricing & ticket tiers updated successfully.",
      conference: state.conferences[confIndex],
    });
  }

  /**
   * PUT /api/conferences/:id
   * Update conference general metadata and ticket tiers
   */
  static updateConference(req: Request, res: Response) {
    const { id } = req.params;
    const { title, date, venue, deadline, status, ticketTiers } = req.body;

    const state = getDbState();
    const confIndex = state.conferences.findIndex((c) => c.id === id);

    if (confIndex === -1) {
      return res.status(404).json({ error: "Conference not found." });
    }

    const current = state.conferences[confIndex];
    state.conferences[confIndex] = {
      ...current,
      ...(title && { title }),
      ...(date && { date }),
      ...(venue && { venue }),
      ...(deadline && { deadline }),
      ...(status && { status }),
      ...(ticketTiers && Array.isArray(ticketTiers) && { ticketTiers }),
    };

    saveDbState(state);
    return res.json(state.conferences[confIndex]);
  }

  /**
   * DELETE /api/conferences/:id
   * Delete a conference assembly and clean up associated items
   */
  static deleteConference(req: Request, res: Response) {
    const { id } = req.params;
    const state = getDbState();
    const confIndex = state.conferences.findIndex((c) => c.id === id);

    if (confIndex === -1) {
      return res.status(404).json({ error: "Conference assembly not found." });
    }

    const deletedConf = state.conferences[confIndex];
    state.conferences.splice(confIndex, 1);

    // Clean up schedule items associated with this conference
    state.schedule = state.schedule.filter((s) => s.conferenceId !== id);

    // If papers were assigned to this conference, re-link to another or keep fallback
    const fallbackConfId = state.conferences[0]?.id || "conf-1";
    state.papers.forEach((p) => {
      if (p.conferenceId === id) {
        p.conferenceId = fallbackConfId;
      }
    });

    saveDbState(state);

    return res.json({
      success: true,
      message: `Conference assembly '${deletedConf.title}' (ID: ${id}) was successfully deleted.`,
    });
  }
}

