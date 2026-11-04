---
layout: page
title: Publications
permalink: /publications/
nav: true
nav_order: 1
description: "* Corresponding author."
---

<div class="publications full-publications" id="publication-list">
  {% bibliography --query @*[year>=2023] %}
  <h2 class="bibliography">Before 2023</h2>
  {% bibliography --group_by none --query @*[year<2023] %}
</div>
