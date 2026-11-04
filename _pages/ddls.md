---
layout: page
title: DDLs
permalink: /ddls/
nav: true
nav_order: 2
---

<div class="deadline-board" data-deadline-board data-date-offset="{{ site.data.deadlines.calendar_timezone.utc_offset }}" data-date-zone="{{ site.data.deadlines.calendar_timezone.label }}">
  <div class="deadline-controls" hidden>
    <span class="deadline-control-label" id="deadline-timezone-label">Timezone</span>
    <div class="deadline-timezone-options" role="group" aria-labelledby="deadline-timezone-label">
      <button type="button" data-timezone="Asia/Shanghai" aria-pressed="true" aria-controls="deadline-results">Beijing (UTC+8)</button>
      <button type="button" data-timezone="Etc/GMT+12" aria-pressed="false" aria-controls="deadline-results">AoE (UTC−12)</button>
      <button type="button" data-timezone="local" aria-pressed="false" aria-controls="deadline-results">Local</button>
    </div>
  </div>

  <noscript><p>Dates below use each conference’s stated timezone. Enable JavaScript for countdowns and timezone conversion.</p></noscript>

  <div id="deadline-results">
    <section class="deadline-section" data-deadline-section="upcoming" aria-label="Conference deadlines">
      <div class="deadline-grid" data-deadline-list="upcoming">
        {% for conference in site.data.deadlines.conferences %}
        {% assign category = site.data.deadlines.categories | where: 'id', conference.category | first %}
        <article class="deadline-card" id="{{ conference.id }}" data-conference-id="{{ conference.id }}" data-estimated="{% if conference.estimate %}true{% else %}false{% endif %}" aria-labelledby="{{ conference.id }}-title">
          <div class="deadline-card-top">
            <div class="deadline-card-tags">
              <span class="deadline-category">{{ category.label }}</span>
              {% if conference.estimate %}<span class="deadline-estimate-badge">Estimated</span>{% endif %}
            </div>
            <div class="deadline-countdown" hidden>
              <span class="deadline-countdown-value"></span>
            </div>
          </div>
          <h3 id="{{ conference.id }}-title"><a href="{{ conference.website }}">{{ conference.title }} <span aria-hidden="true">↗</span></a></h3>
          {% assign track_label = conference.track | remove: 'Main conference' | remove: 'Research papers' | remove: ' · ' | strip %}
          {% if track_label != empty %}
          <p class="deadline-track">{{ track_label }}</p>
          {% endif %}
          <p class="deadline-conference-name">{{ conference.name }}</p>
          <dl class="deadline-milestones">
            {% assign milestones = conference.deadlines | concat: conference.review_dates %}
            {% for deadline in milestones %}
            <div class="deadline-milestone" id="{{ conference.id }}-milestone-{{ forloop.index }}" data-kind="{{ deadline.kind | default: 'submission' }}" data-at="{{ deadline.at }}" data-date="{{ deadline.date }}" data-end-date="{{ deadline.end_date }}" data-reference-date="{{ deadline.reference_date }}" data-reference-end-date="{{ deadline.reference_end_date }}" data-prerequisite="{{ deadline.prerequisite | default: false }}" data-closed-message="{{ deadline.closed_message | escape }}"{% if deadline.scope %} title="{{ deadline.scope | escape }}"{% endif %}>
              <dt><span class="deadline-milestone-label">{{ deadline.label }}</span>{% if deadline.tentative %} <span class="deadline-tentative">Tentative</span>{% endif %}</dt>
              <dd>
                {% if deadline.at %}
                <time datetime="{{ deadline.at }}"{% if deadline.reference_at %} data-reference-at="{{ deadline.reference_at }}" title="Estimated from {{ deadline.reference_at | slice: 0, 10 }} {{ deadline.reference_at | slice: 11, 8 }} {{ conference.source_timezone }}"{% else %} title="{{ deadline.at | slice: 0, 10 }} {{ deadline.at | slice: 11, 8 }} {{ conference.source_timezone }}"{% endif %}>{{ deadline.at | slice: 0, 10 }} {{ deadline.at | slice: 11, 8 }} {{ conference.source_timezone }}</time>
                {% elsif deadline.date %}
                <span class="deadline-calendar-date" title="Calendar dates in {{ site.data.deadlines.calendar_timezone.label }}; countdown shown in days."><time datetime="{{ deadline.date }}">{{ deadline.date | date: '%d %b %Y' }}</time>{% if deadline.end_date %}–<time datetime="{{ deadline.end_date }}">{{ deadline.end_date | date: '%d %b %Y' }}</time>{% endif %} <span class="deadline-date-zone">{{ site.data.deadlines.calendar_timezone.label }}</span></span>
                {% else %}
                <span class="deadline-date-pending">TBA</span>
                {% endif %}
              </dd>
            </div>
            {% else %}
            <div class="deadline-milestone"><dt>Submission</dt><dd>To be announced</dd></div>
            {% endfor %}
          </dl>
          <p class="deadline-prerequisite-note" hidden></p>
          <div class="deadline-card-footer">
            <span class="deadline-event-dates">{{ conference.conference_dates }}</span><span class="deadline-location">{{ conference.location }}</span>
          </div>
        </article>
        {% endfor %}
      </div>
    </section>

    <section class="deadline-section" data-deadline-section="pending" aria-labelledby="deadline-pending-title" hidden>
      <div class="deadline-section-heading">
        <h2 id="deadline-pending-title">Awaiting dates</h2>
      </div>
      <div class="deadline-grid" data-deadline-list="pending"></div>
    </section>

    <details class="deadline-section deadline-past" data-deadline-section="past" hidden>
      <summary class="deadline-section-heading"><h2>Past deadlines</h2></summary>
      <div class="deadline-grid" data-deadline-list="past"></div>
    </details>
  </div>
</div>
<script type="module" src="{{ '/assets/js/deadlines.mjs' | relative_url }}"></script>
