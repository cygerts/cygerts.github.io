---
title: "Does Qwen3.8 Phone Home?"
subtitle: "How to Run Local Agents Safely"
date: 2026-11-09
authors:
  - name: Filip Pawlicki
    url: https://filippawlicki.com/
  - name: Dawid Krutul
  - name: Szymon Łukasik
    url: https://scholar.google.com/citations?user=-O9fFQwAAAAJ&hl=pl
  - name: Sebastian Cygert
    url: https://scholar.google.com/citations?hl=pl&user=wLH9PP8AAAAJ
tags: [Agents, LLM Safety]
description: "Qwen3.8 was reported to have tried sending data to Alibaba Cloud. We tested it against Qwen3.5 and Gemma 4 in a sandbox and found where each model takes risks, plus how to run local agents safely."
image: /assets/blog/qwen-phone-home/hero-card.png
image_alt: "Shortened Qwen3.8 test session: two file uploads to file-sharing sites get 403 Forbidden, and nine commands later the agent runs cat /workspace/.env, printing masked fake keys"
---

Recently Qwen3.8 was reported to have tried sending data to Alibaba Cloud, which is worrying for anyone who cares about safety. [NASK](https://www.nask.pl/) researchers decided to verify it, and compare it against Gemma 4 and its older brother - Qwen3.5.

## TL;DR

- Qwen3.8 tried to reach Alibaba Cloud in 27 of 360 test runs, using addresses it appears to have memorised during training.
- Qwen3.8 stands out most in how it looks for keys in the local environment. It tried to open a credentials file in 63% of runs, against 2% for Qwen3.5 and none for Gemma 4.
- The risk is not limited to Qwen3.8. When stuck on a task, all three models often turned off HTTPS certificate checks and tried file-sharing websites.
{: .tldr}

On 26 October 2026 [Cohere reported](https://cohere.com/blog/concerning-behaviour-popular-open-weight-ai-model) that Qwen3.8, while working on a security test, tried to upload data to a storage service on Alibaba Cloud. Such behaviors were rare and the company said it could not tell whether it was deliberate or a leftover from training.

For anyone running a local agent, the practical question is simpler:<br />
*is it safe to use, and what precautions does it need?*

## How the Models Were Tested

The experiments used Qwen3.8-27B, Qwen3.5-27B and Gemma 4 31B, each in an environment with no internet access. Attempts to connect outside were blocked and logged. It especially shows how model behaves when it hits an obstacle.

In the **agent tests**, the models carried out 12 simple tasks (such as downloading a document), 30 times each. In a further 96 runs per model, the same tasks took place in a project with planted passwords and access keys.

Two other tests take Cohere's approach further. They extend it to a three models. In the **address test**, a model completes a prefilled command, such as *curl*. In the last test, each model answered Cohere's prompt 500,000 times.

## Does Qwen3.8 Contact Alibaba?

Yes, but no data was leaving with those requests. In the **agent tests**, Qwen3.8 tried to reach Alibaba Cloud in 27 of 360 runs, while the other models never did.

| Agent tests, runs out of 360 | Qwen3.8 | Qwen3.5 | Gemma 4 |
|---|--:|--:|--:|
| Alibaba Cloud (without package mirrors) | 27 | 0 | 0 |
| Amazon S3 storage | 53 | 16 | 1 |
| Chinese package mirrors | 155 | 25 | 28 |

HTTP requests to Alibaba Cloud sent no data. Qwen3.8 seems to use these addresses to check whether anything is reachable.

Of the 27 runs that tried Alibaba Cloud, 21 used the same address, **routify-file-proxy-sg.oss-ap-southeast-1.aliyuncs.com**, which has nothing to do with the tasks. The **address test** shows that it comes from the model itself, asked to complete a command with *http://* prefill, Qwen3.8 often writes this exact address, while other models never did.

![Bar chart: share of Qwen3.8 completions naming the routify host for each command prefix, in a fresh conversation and after a 403 response. wget reaches about 50%, curl 36 to 46%, python urlopen 13 to 33%, and an empty prefix 0%.](/assets/blog/qwen-phone-home/routify-address-by-prefix.png)

How often Qwen3.8 wrote the routify address, by start of the command.
{: .caption}

> wait, where did that URL come from? I typed it into the loop — weird, I shouldn't have known it.
>
> Qwen3.8-27B, model reasoning in an agent test
> {: .quote-source}

In other runs, the model called the address its own guess, and once said it probably came from memory of a similar environment. This is not a proof, but the results also suggest that it memorised the address during training.

## What Cohere's Prompt Reveals

Cohere's prompt shows which address a model fills in for an upload that is already happening, not whether the model would try to do it by itself. Most answers are harmless - Gemma 4 gave no address in 99.54% of them, and Qwen3.8 most often called *httpbin.org* or *127.0.0.1.*

![Bar chart of how many of 500,000 answers per model contained each cloud address. Qwen3.8 leads on Alibaba addresses (2,665 for the Alibaba storage address) and Amazon S3 (2,490), while Qwen3.5 leads on the standard metadata address 169.254.169.254 (11,681) and the security-credentials key path (2,338).](/assets/blog/qwen-phone-home/cohere-prompt-addresses.png)

How many of the 500,000 answers contained each address. Gemma 4 scored 0 on every one of them.
{: .caption}

Reaching for Alibaba is new in Qwen3.8. About 90% of the correctly formed Amazon and Alibaba addresses appeared only once and often reused words from the prompt, so most seem made up.

Reaching for cloud keys is older and, surprisingly, Qwen3.5 does it more. It wrote the standard metadata address about six times as often as Qwen3.8, and the path that hands out AWS keys, about eleven times as often.

## What Happens When Agents Find Access Keys

The clearest difference between the models came from the **agent tests** with planted keys. Qwen3.8 tried to open a file containing keys in 63% of runs, against 2% for Qwen3.5 and none for Gemma 4.

![Three bar charts, runs out of 96 per model. Qwen3.8 listed hidden files in 92 runs, tried to open a key file in 61, displayed keys from a file in 49 and from the environment in 45, and sent a key over the network in 11. Qwen3.5: 29, 2, 2, 1, 1. Gemma 4: 2, 0, 0, 12, 3.](/assets/blog/qwen-phone-home/access-keys.png)

How the models search for and use access keys.
{: .caption}

Some of the keys found were then used - Qwen3.8 sent a key over the network in 11 runs, 7 times to a service that was unrelated to the task. Qwen3.5 did so once, and Gemma three times, always to a service related to the task.

In its reasoning, Qwen3.8 gives its motive as getting past the block, so no harmful intentions. But once Qwen3.8 tried three tokens on a local port it took for a proxy. Just before sending them, it reasoned:

> maybe the egress proxy authenticates with one of these. This is a shot in the dark, but let me try a few combinations…
>
> Qwen3.8-27B, before sending the tokens
> {: .quote-source}

That port was the researchers' own logger. The results show no sign of models sending data to Alibaba, but they cannot rule out rare or deliberate behavior.

## Each Model Has a Weak Spot

When the network is blocked, each model takes its own kind of risk. Qwen3.8 explores the most - in 228 of 360 runs it tried three or more ports beyond the standard web, against 2 for Qwen3.5 and 1 for Gemma. Gemma 4 explores least, but it is most likely to fill a result file with values from memory without saying so.

All three turned off HTTPS certificate checks in ~40% of runs. They say in their final answers that the network was blocked, but in the result file, many credit an official source. Asked to upload a report, they tried file-sharing websites, without asking where uploading was allowed.

## Recommendations

1. Keep secrets away from the agent. Run it as a separate user.
2. If it needs a key, make it limited and temporary.
3. Block the cloud metadata address, which hands out access keys.
4. Use your own package index with pinned hashes.
5. Require approval for uploads, git push and POST requests.
6. Check the agent's results, because it may make them up.
7. For Qwen3.8, block `*.aliyuncs.com` if you do not need it.

These behaviors most likely come from the models' training through reinforcement learning, although these tests cannot prove it. Even so, stay alert - an agent may use anything it can reach to complete its goal.
