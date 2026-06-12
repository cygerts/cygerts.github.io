---
layout: page
title: Publications
permalink: /publications/
---

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,700&display=swap" rel="stylesheet" />

<style>
  .pub-wrap {
    --ink: #1b2430;
    --muted: #5b6572;
    --line: #d8dee8;
    --card: #fbfdff;
    --accent: #0e7490;
    --chip-bg: #edf8fb;
    --chip-text: #115e71;
    --tag-bg: #f6f8fb;
    --tag-text: #4a5565;
    --btn-bg: #f2f6fb;
    --btn-text: #1f3047;
    font-family: "DM Sans", "Segoe UI", sans-serif;
    color: var(--ink);
  }

  .pub-header {
    margin-bottom: 1.4rem;
  }

  .pub-header p {
    margin: 0;
    color: var(--muted);
  }

  .pub-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0 1.6rem;
  }

  .pub-filter button {
    border: 1px solid var(--line);
    border-radius: 999px;
    background: #fff;
    color: var(--muted);
    font: 500 0.85rem/1 "DM Sans", sans-serif;
    padding: 0.45rem 0.85rem;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .pub-filter button:hover,
  .pub-filter button.is-active {
    border-color: var(--accent);
    color: #fff;
    background: var(--accent);
  }

  .pub-list {
    display: grid;
    gap: 1rem;
  }

  .pub-card {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--card);
    box-shadow: 0 4px 14px rgba(16, 24, 40, 0.05);
  }

  .pub-card[hidden] {
    display: none;
  }

  .pub-thumb {
    margin: 0;
  }

  .pub-thumb img {
    width: 100%;
    border-radius: 10px;
    border: 1px solid var(--line);
    display: block;
  }

  .pub-title {
    margin: 0;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  .pub-authors {
    margin: 0.45rem 0 0;
    color: var(--muted);
    font-size: 0.96rem;
  }

  .pub-meta {
    margin: 0.6rem 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .pub-chip {
    display: inline-block;
    border-radius: 999px;
    padding: 0.2rem 0.6rem;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .pub-chip.venue {
    background: var(--chip-bg);
    color: var(--chip-text);
  }

  .pub-chip.topic {
    background: var(--tag-bg);
    color: var(--tag-text);
  }

  .pub-links {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .pub-links a {
    text-decoration: none;
    border: 1px solid var(--line);
    background: var(--btn-bg);
    color: var(--btn-text);
    border-radius: 8px;
    padding: 0.3rem 0.62rem;
    font-size: 0.82rem;
    font-weight: 600;
  }

  .pub-links a:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: #fff;
  }

  .pub-empty {
    display: none;
    margin-top: 0.65rem;
    color: var(--muted);
  }

  @media (max-width: 760px) {
    .pub-card {
      grid-template-columns: 1fr;
    }

    .pub-thumb {
      max-width: 260px;
    }
  }
</style>

<section class="pub-wrap">
  <div class="pub-header">
 
 
  </div>

  <!--
  <div class="pub-filter" aria-label="Publication filters">
    <button class="is-active" data-filter="all" type="button">All</button>
    <button data-filter="conference" type="button">Conference</button>
    <button data-filter="preprint" type="button">Preprint</button>
    <button data-filter="llm-safety" type="button">LLM Safety</button>
    <button data-filter="vision-language" type="button">Vision-Language</button>
    <button data-filter="benchmarking" type="button">Benchmarking</button>
  </div>
  -->

  <div class="pub-list" id="pub-list">
    <article class="pub-card" data-topics="conference llm-safety">
      <figure class="pub-thumb">
        <img src="/assets/publications/efficient-llm-moderation.png" alt="Efficient LLM Moderation publication cover" />
      </figure>
      <div>
        <h3 class="pub-title">Efficient LLM Moderation with Multi-Layer Latent Prototype</h3>
        <p class="pub-authors">Maciej Chrabąszcz, Filip Szatkowski, Bartosz Wójcik, Jan Dubiński, Tomasz Trzciński, Sebastian Cygert</p>
        <div class="pub-meta">
          <span class="pub-chip venue">ICML 2026</span>
          <!--
          <span class="pub-chip topic">LLM Safety</span>
          -->
        </div>
        <div class="pub-links">
          <a href="https://arxiv.org/pdf/2502.16174" target="_blank" rel="noopener noreferrer">PDF</a>
          <a href="https://github.com/maciejchrabaszcz/latent-prototype-moderator" target="_blank" rel="noopener noreferrer">code</a>
        </div>
      </div>
    </article>

    <article class="pub-card" data-topics="conference benchmarking">
      <figure class="pub-thumb">
        <img src="/assets/publications/reliability-gap.png" alt="Reliability Gap publication cover" />
      </figure>
      <div>
        <h3 class="pub-title">The Reliability Gap in Benchmark Auditing: Distribution Shift and Scale as Failure Modes of Contamination Detection</h3>
        <p class="pub-authors">Wojciech Zarzecki, Jan Dubiński, Sebastian Cygert</p>
        <div class="pub-meta">
          <span class="pub-chip venue">ECML 2026</span>
          <!--
          <span class="pub-chip topic">Benchmarking</span>
          -->
        </div>
        <div class="pub-links">
          <a href="https://arxiv.org/pdf/2606.03305" target="_blank" rel="noopener noreferrer">PDF</a>
        </div>
      </div>
    </article>

    <article class="pub-card" data-topics="preprint llm-safety">
      <figure class="pub-thumb">
        <img src="/assets/publications/internal-monologue.png" alt="Internal Monologue publication cover" />
      </figure>
      <div>
        <h3 class="pub-title">Monitoring the Internal Monologue: Probe Trajectories Reveal Reasoning Dynamics</h3>
        <p class="pub-authors">Aleksander Szymczyk, Marcin Sendera, Sebastian Cygert</p>
        <div class="pub-meta">
          <span class="pub-chip venue">arXiv Preprint</span>
          <!--
          <span class="pub-chip topic">LLM Safety</span>
          -->
        </div>
        <div class="pub-links">
          <a href="https://arxiv.org/abs/2605.18549" target="_blank" rel="noopener noreferrer">Paper</a>
        </div>
      </div>
    </article>

    <article class="pub-card" data-topics="conference vision-language">
      <figure class="pub-thumb">
        <img src="/assets/publications/jailbreaking-vlm.png" alt="Jailbreaking VLM publication cover" />
      </figure>
      <div>
        <h3 class="pub-title">Jailbreaking Vision-Language Models Through the Visual Modality</h3>
        <p class="pub-authors">Aharon Azulay, Jan Dubiński, Zhuoyun Li, Atharv Mittal, Yossi Gandelsman</p>
        <div class="pub-meta">
          <span class="pub-chip venue">ICML 2026</span>
          <!--
          <span class="pub-chip topic">Vision-Language</span>
          -->
        </div>
        <div class="pub-links">
          <a href="https://arxiv.org/pdf/2605.00583" target="_blank" rel="noopener noreferrer">PDF</a>
        </div>
      </div>
    </article>

    <article class="pub-card" data-topics="preprint llm-safety">
      <figure class="pub-thumb">
        <img src="/assets/publications/activation-transport.png" alt="Activation Transport publication cover" />
      </figure>
      <div>
        <h3 class="pub-title">Conditioned Activation Transport for T2I Safety Steering</h3>
        <p class="pub-authors">Maciej Chrabąszcz, Aleksander Szymczyk, Jan Dubiński, Tomasz Trzciński, Franziska Boenisch, Adam Dziedzic</p>
        <div class="pub-meta">
          <span class="pub-chip venue">arXiv Preprint</span>
          <!--
          <span class="pub-chip topic">LLM Safety</span>
          -->
        </div>
        <div class="pub-links">
          <a href="https://arxiv.org/pdf/2603.03163" target="_blank" rel="noopener noreferrer">PDF</a>
            <a href="https://github.com/NASK-AISafety/conditional-activation-transport" target="_blank" rel="noopener noreferrer">code</a>
        </div>
      </div>
    </article>
  </div>

  <!-- <p class="pub-empty" id="pub-empty">No publications match this filter yet.</p> -->
</section>

<!--
<script>
  (function () {
    var buttons = document.querySelectorAll(".pub-filter button");
    var cards = document.querySelectorAll(".pub-card");
    var empty = document.getElementById("pub-empty");

    function applyFilter(topic) {
      var visible = 0;

      cards.forEach(function (card) {
        var topics = (card.getAttribute("data-topics") || "").split(" ");
        var show = topic === "all" || topics.indexOf(topic) >= 0;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      empty.style.display = visible === 0 ? "block" : "none";
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        applyFilter(button.getAttribute("data-filter"));
      });
    });
  })();
</script>
-->
