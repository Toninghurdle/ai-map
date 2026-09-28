import type { Metadata } from "next";
import { HeaderControls } from "@/components/HeaderControls";
import { EMAIL_DISPLAY, ReportLink } from "@/components/ReportLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why the AI Safety and Security Field Map exists, how to read it, and how far to trust it.",
};

/**
 * docs/about.md, "About page" section, rendered word for word (task brief
 * item 4: "Do not paraphrase, do not add or drop a sentence"). The one
 * change from the source text is the sign-off's email sentence, which goes
 * through ReportLink so the plain address never appears in the page source.
 * The address itself comes from EMAIL_DISPLAY, the one spelling used
 * everywhere on the site, which docs/about.md now matches.
 */
export default function AboutPage() {
  return (
    <main className="fm-page fm-about fm-detail">
      <HeaderControls />
      <h1>About this map</h1>

      <SectionHeading>Why this exists</SectionHeading>
      <p>
        I&apos;m starting to move into AI safety and security from running a company. Early on I
        wanted a map of the field: the problems people are trying to solve, and who&apos;s
        working on each of them. There are good lists of courses, reading and jobs. I couldn&apos;t
        find anything that started from the problems, so I began building one.
      </p>
      <p>
        It&apos;s meant for people in a similar position to me. You know enough to care about this
        and to follow the arguments, but you can&apos;t yet see how it all fits together. I hope
        it makes the field feel less overwhelming and helps you work out where you might fit.
      </p>

      <SectionHeading>How to read it</SectionHeading>
      <p>
        Every hex is a problem someone could work on. They&apos;re grouped into four layers: the
        model itself, harmful use, society and government, and the infrastructure the rest of the
        field stands on.
      </p>
      <p>
        The colour of a hex shows how much work is happening on it, from a little to busy. Busy
        doesn&apos;t mean solved. It usually means there are organisations you could join. Click
        any problem to see who&apos;s working on it and how to reach them.
      </p>

      <SectionHeading>Before you trust it</SectionHeading>
      <p>
        Most of what you see was compiled by AI research agents in September 2026, working to
        rules I wrote, with me making the judgement calls. No subject-matter expert has reviewed
        it yet.
      </p>
      <p>
        Some parts are thinner than others. Coverage of the Global South and China is weak. About
        a third of the links point to an organisation&apos;s homepage rather than the specific
        work. Some definitions will be wrong in ways an expert would spot in seconds.
      </p>
      <p>Every organisation on the map links to the source that put it there, so you can check anything yourself.</p>

      <SectionHeading>Help me make it better</SectionHeading>
      <p>
        If something&apos;s wrong or missing, including your own organisation,{" "}
        <ReportLink subject="About page" className="fm-inline-report-link">
          email me at {EMAIL_DISPLAY}
        </ReportLink>
        .
      </p>
      <p>
        I&apos;d especially like to hear from anyone willing to look after one part of the map
        over time. If it turns out to be useful, I&apos;d like it to become something people in
        the field keep up to date together, with a named person for each area.
      </p>
      <p>The data is free to reuse under CC BY 4.0.</p>

      <p className="fm-sign-off">Dominic Deane</p>
    </main>
  );
}
