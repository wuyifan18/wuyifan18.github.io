---
layout: about
title: Home
permalink: /
selected_papers: false
hide_arxiv_links: true
social: false
---

<div class="home-intro">
  <div class="profile-sidebar">
    <img class="profile-avatar" src="{{ '/assets/img/avatar.png' | relative_url }}" alt="Alpaca avatar" width="656" height="632" fetchpriority="high">
    <div class="contact-links" role="group" aria-label="Contact and profiles">
      <a href="mailto:yifanwu@pku.edu.cn" aria-label="Email" title="Email">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
      </a>
      <a href="https://scholar.google.com/citations?user=Z6njI40AAAAJ" aria-label="Google Scholar" title="Google Scholar">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z"/></svg>
      </a>
    </div>
  </div>
  <div class="intro-copy">
    <p class="intro-text">I am a postdoctoral researcher in the School of Computer Science at Peking University. I received my Ph.D. in Software Engineering from Peking University in 2025, advised by Prof. <a href="https://ss.pku.edu.cn/sztd/xssbsz/cd38cb490d9648ba863cffea67a1a941.htm">Ying Li</a>, and my B.E. in Software Engineering from the University of Electronic Science and Technology of China in 2019.</p>
    <p class="intro-text">My research focuses on building trustworthy LLM-based agent systems. I seek to understand how failures and security risks arise as agents reason, act, and interact, and to develop methods that make their behavior more reliable, safe, and secure.</p>
  </div>
</div>

<section class="home-section" aria-labelledby="selected-publications">
  <div class="section-heading">
    <h2 id="selected-publications">Selected Publications</h2>
    <a class="all-publications" href="{{ '/publications/' | relative_url }}">All publications <span aria-hidden="true">→</span></a>
  </div>
  <div class="publications selected-publications">
    {% bibliography --group_by none --query @*[selected=true]* %}
  </div>
</section>

<section class="home-section academic-services" aria-labelledby="academic-services">
  <h2 id="academic-services">Academic Services</h2>
  <h3>Area Chair</h3>
  <p><strong>2027:</strong> NAACL</p>
  <h3>PC Member</h3>
  <p><strong>2027:</strong> ICSE SEIP, FSE Industry, KDD, AAAI, ICLR, WWW<br><strong>2026:</strong> ICSE SEIP, ICSME Industry, KDD, ACMMM, NeurIPS</p>
  <h3>Journal Reviewer</h3>
  <p>TSE, TOSEM, TCC, IST, JSS, ASEJ, ESWA, KBS, FGCS</p>
</section>
