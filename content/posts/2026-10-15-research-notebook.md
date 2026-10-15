---
title: From social influence to efficient knowledge transfer
date: 2026-10-15
category: Research perspective
summary: The questions connecting my work on recommender systems, knowledge distillation, and the adaptation of language models.
slug: research-notebook
draft: false
---

My research asks how intelligent systems can learn from relationships: between people, between models, and between a model's internal components. This notebook is a place to connect those questions with the papers, methods, and software behind them.

## Learning from people

My earlier work focuses on recommender systems. A recommendation for a group raises a different question from a recommendation for one person: how should a system account for the interactions among its members?

Trust, similarity, and leadership are central to my work in this area. In [our study of member influence and leader impact](https://doi.org/10.1016/j.knosys.2020.106296), we investigated how these relationships can inform group recommendation. Related work examines how trust networks can be constructed implicitly from user ratings.

More recently, my research on [leader-centric adaptive group formation](https://doi.org/10.1016/j.eswa.2026.131864) investigates multi-agent reinforcement learning for group recommendation. The focus moves toward decisions that respond to changing preferences and interactions.

## Learning from other models

Knowledge distillation introduces another kind of relationship: a student model learning from a teacher. My current manuscripts explore what information should be transferred, how representations should be aligned, and when teacher supervision is most useful.

These projects investigate geometric alignment and optimal transport, alongside the computational cost of querying a teacher. They are ongoing research directions; the manuscripts remain separate from my published journal articles on this website.

## Understanding adaptation

My interests also extend to the internal mechanisms of language models. The CRAT manuscript explores causally routed adaptive tuning for machine translation. The motivating question is which model components matter for a particular input, and how that understanding might inform parameter-efficient adaptation.

These questions connect with my broader interest in probabilistic modeling and interpretable machine learning. The settings differ, but the recurring concern is how to model an interaction well enough to use it in a learning algorithm.

## Papers and implementations

The [publications page](../../publications/) collects my journal articles and preprint, with DOI links and downloadable citations. The [projects page](../../projects/) includes research software and implementations of other authors' methods, with their attribution preserved.

For a discussion about these research directions, you can reach me at [barzegar@eng.ui.ac.ir](mailto:barzegar@eng.ui.ac.ir).
