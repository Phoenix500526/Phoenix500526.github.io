---
title: 关于我
layout: about
aside: false
comments: false
description: Phoenix（Jiawei Zhao）的个人介绍与开源贡献，涵盖分布式系统、AI Agent、数据基础设施和 eBPF。
---
{% raw %}
  <section class="topic-section" id="consensus">
    <h2 class="section-title">Distributed System Consensus Algorithms</h2>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://github.com/xline-kv/Xline">Xline</a></h3>
          <span class="scope">&middot; Rust &middot; geo-distributed metadata store</span>
        </div>
        <span class="role"><a href="https://github.com/xline-kv/Xline/blob/master/MAINTAINERS">Maintainer</a></span>
      </div>

      <div class="link-row period-right">
        <div>Oct. 2022 &ndash; Jun. 2024</div>
      </div>

      <p class="project-summary">
        Xline is a strongly consistent metadata store for geo-distributed deployments. It provides etcd-compatible APIs and uses CURP to reduce the consensus path to one RTT under low contention; the project was accepted into the <a href="https://www.cncf.io/projects/xline/">CNCF Sandbox</a> in 2023.
      </p>

      <ul>
        <li>
          <span class="lead">Turned CURP from a consensus protocol implementation into the durable core of a recoverable metadata store.</span>
          Designed pluggable storage abstractions and a RocksDB backend, then completed batching, compaction, and recovery paths so Xline could run reliably on persistent storage.
        </li>
        <li>
          <span class="lead">Restored Xline's etcd Watch semantics for Kubernetes integration.</span>
          Traced lost events that stalled <code>kubeadm init</code> to revision-notification tracking and repaired event continuity, allowing Kubernetes workflows that depend on etcd Watch to complete.
        </li>
        <li>
          <span class="lead">Authored <a href="https://www.cncf.io/blog/2024/02/19/analysis-of-xline-jepsen-tests/">Xline's Jepsen analysis</a> and used failed histories to challenge its persistence and revision design.</span>
          Identified ordering hazards in asynchronous persistence and the fundamental mismatch between CURP's one-RTT path and etcd's globally ordered revisions, guiding correctness-first changes to both designs.
        </li>
        <li>
          <span class="lead">Led Xline's admission to the CNCF Sandbox and established its public governance and delivery process.</span>
          Institutionalized maintainer policy, commit checks, coverage reporting, image and release publishing, quarterly reports, and community meetings, giving the project repeatable delivery and external review mechanisms.
        </li>
      </ul>

      <div class="evidence">
        <span class="label">CNCF Blogs</span>
        <a href="https://www.cncf.io/blog/2023/09/20/the-introduction-to-the-curp-protocol/">CURP protocol</a>
        &middot;
        <a href="https://www.cncf.io/blog/2023/06/28/the-design-and-implementation-of-the-xline-persistent-storage-layer/">Persistent storage</a>
        &middot;
        <a href="https://www.cncf.io/blog/2024/02/19/analysis-of-xline-jepsen-tests/">Jepsen analysis</a>
      </div>
    </article>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://github.com/databendlabs/openraft">OpenRaft</a></h3>
          <span class="scope">&middot; Rust &middot; Raft consensus library</span>
        </div>
        <span class="role long"><a href="https://github.com/databendlabs/openraft/graphs/contributors?all=1">#2 Contributor</a> / Databend Labs Outside Collaborator</span>
      </div>

      <div class="link-row period-right">
        <div>Jun. 2024 &ndash; Present</div>
      </div>

      <p class="project-summary">
        OpenRaft is a Rust Raft consensus library for distributed databases and storage systems, with pluggable storage, networking, and asynchronous runtimes; it powers Databend's metadata service and is also adopted by CnosDB, RobustMQ, and RocketMQ-rust.
      </p>

      <ul>
        <li>
          <span class="lead">Built OpenRaft's CI-integrated Jepsen validation track from the ground up.</span>
          Covered network partitions, process pauses and failures, packet delay and loss, clock skew, and membership changes; added linearizability checks, explicit error semantics, panic and interruption handling, and recovery validation so faults remain reproducible and aborted runs cannot pass as successful.
        </li>
        <li>
          <span class="lead">Moved Jepsen onto OpenRaft's shared RocksDB state machine and checkpoint implementation.</span>
          Replacing the duplicated in-memory path made fault injection exercise persistent storage, snapshots, and recovery; the migration exposed and fixed a path-normalization bug that deleted the active database directory during startup cleanup, restoring snapshot creation and valid five-node partition and process-fault runs.
        </li>
        <li>
          <span class="lead">Found and fixed a Raft liveness deadlock in which stale Leader traffic blocked a reachable majority from electing a replacement.</span>
          Designed quorum-loss inactivity and recovery probing so the majority could elect a new Leader and resume writes while the network partition remained in place.
        </li>
        <li>
          <span class="lead">Hardened leader removal across recovery and consecutive membership changes.</span>
          Enabled committed voters to campaign when the final configuration remained uncommitted, removed a debug panic when an excluded but still-leading node proposed the next configuration, and added double-shrink Jepsen coverage under both step-down policies so reconfiguration and writes recover without manual storage repair.
        </li>
      </ul>
    </article>
  </section>
  <section class="topic-section" id="agents">
    <h2 class="section-title">AI Agent Systems &amp; Frameworks</h2>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://github.com/0xPlaygrounds/rig">rig</a></h3>
          <span class="scope">&middot; Rust &middot; LLM application framework</span>
        </div>
        <span class="role"><a href="https://github.com/0xPlaygrounds/rig/pulls?q=is%3Apr+state%3Aclosed+author%3APhoenix500526">Contributor</a></span>
      </div>

      <div class="link-row period-right">
        <div>Dec. 2025 &ndash; Feb. 2026</div>
      </div>

      <p class="project-summary">
        Rig is a Rust framework for modular LLM applications and agent workflows, unifying more than 20 model providers and 10 vector stores behind common interfaces; its public users include <a href="https://github.com/0xPlaygrounds/rig#who-is-using-rig">Ironclaw, Archestra, Listen, and VT Code</a>.
      </p>

      <ul>
        <li>
          <span class="lead">Prevented parallel tool calls from being corrupted by OpenAI-compatible gateways that reuse streaming indices.</span>
          Added ID-aware accumulation so LiteLLM and OneAPI responses preserve each call's name and arguments instead of merging distinct calls.
        </li>
        <li>
          <span class="lead">Added a policy control for hosts to reject tool execution through <code>on_tool_call</code> hooks.</span>
          Returned the rejection reason to the model as a tool result, enabling applications to enforce safety or business rules without breaking the agent loop.
        </li>
        <li>
          <span class="lead">Made streaming agents easier to integrate in multi-provider applications.</span>
          Returned updated shared history through <code>FinalResponse</code> and exposed <code>StreamingError</code>, allowing callers to retain multi-turn state and handle failures through public APIs.
        </li>
      </ul>
    </article>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://github.com/apache/maka">Apache/Maka</a></h3>
          <span class="scope">&middot; TypeScript &middot; local-first AI agent workspace</span>
        </div>
        <span class="role"><a href="https://github.com/apache/maka/pulls?q=is%3Apr+state%3Aclosed+author%3APhoenix500526">Contributor</a></span>
      </div>

      <div class="link-row period-right">
        <div>Aug. 2026 &ndash; Present</div>
      </div>

      <p class="project-summary">
        Apache Maka (Incubating) is a local-first agent workspace that records model messages, tool calls, permission decisions, and termination as durable events, with Desktop, TUI, CLI, and Eval sharing one Runtime Host.
      </p>

      <ul>
        <li>
          <span class="lead">Made long usage histories responsive by paginating the Activity Log at 50 records per page.</span>
          On a 409-record benchmark, reduced median render time from 1,616.9 ms to 74.0 ms, a 21.9&times; speedup, while retaining search and filter behavior.
        </li>
        <li>
          <span class="lead">Defined explicit session-lifecycle behavior across archive and teardown.</span>
          Blocked archived sessions from automatic refreshes and carried caller-initiated teardown as cancellation instead of failure, eliminating stale queries and spurious startup errors.
        </li>
        <li>
          <span class="lead">Restored Desktop startup by separating Node-only cryptography from the browser protocol boundary.</span>
          Moved identity hashing behind Runtime Host exports and added Vite regression coverage, allowing the Renderer to mount without weakening Node-side capabilities.
        </li>
        <li>
          <span class="lead">Moved repository invariants into fast local quality gates.</span>
          Added pre-commit checks for formatting, lint, ASF headers, protocol epochs, and diff errors plus Conventional Commit validation, catching violations before push and reducing avoidable CI cycles.
        </li>
      </ul>
    </article>
  </section>
  <section class="topic-section" id="data">
    <h2 class="section-title">Data Infrastructure</h2>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://github.com/apache/datafusion">Apache/DataFusion</a></h3>
          <span class="scope">&middot; Rust &middot; extensible query engine</span>
        </div>
        <span class="role"><a href="https://github.com/apache/datafusion/pulls?q=is%3Apr+state%3Aclosed+author%3APhoenix500526">Contributor</a></span>
      </div>

      <div class="link-row period-right">
        <div>Jun. 2026 &ndash; Present</div>
      </div>

      <p class="project-summary">
        Apache DataFusion is an extensible query engine built with Rust and Apache Arrow, providing SQL, DataFrame, vectorized streaming execution, and custom extension APIs; it is adopted by InfluxDB, GreptimeDB, Apache Comet, dbt Fusion, and Cloudflare R2 Query Engine.
      </p>

      <ul>
        <li>
          <span class="lead">Implemented asynchronous spill writes for query execution.</span>
          Reused Apache/arrow-rs's sans-I/O IPC encoder so remote and object-store backends can upload data as it is produced without blocking an async runtime or buffering an entire spill file, while preserving synchronous compatibility and cleanup after failures or cancellation.
        </li>
        <li>
          <span class="lead">Moved physical-plan Protobuf serialization from centralized type dispatch into <code>ExecutionPlan</code> and <code>DataSink</code> extension hooks.</span>
          Enabled execution nodes and custom sinks to own their serialization logic, reducing coupling in the central serializer while preserving the existing wire format and compatibility path.
        </li>
        <li>
          <span class="lead">Fixed SQL unparsing across nested aggregates and stacked projections.</span>
          Preserved expression scope and removed out-of-scope table qualifiers from optimized plans, preventing invalid SQL while retaining correct <code>SELECT</code> and <code>GROUP BY</code> semantics.
        </li>
        <li>
          <span class="lead">Made the file-statistics cache schema-aware.</span>
          Prevented statistics from being reused against mismatched column layouts and causing panics, while restoring safe cache reuse for repeated explicit-schema reads.
        </li>
      </ul>
    </article>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://github.com/apache/arrow-rs">Apache/arrow-rs</a></h3>
          <span class="scope">&middot; Rust &middot; Arrow IPC and Parquet</span>
        </div>
        <span class="role"><a href="https://github.com/apache/arrow-rs/pulls?q=is%3Apr+state%3Aclosed+author%3APhoenix500526">Contributor</a></span>
      </div>

      <div class="link-row period-right">
        <div>Jul. 2026 &ndash; Present</div>
      </div>

      <p class="project-summary">
        Apache/arrow-rs is the official Rust implementation of Apache Arrow and Apache Parquet, providing the columnar memory format, IPC, and Parquet primitives used across the Rust data ecosystem.
      </p>

      <ul>
        <li>
          <span class="lead">Designed and implemented the public sans-I/O <code>StreamEncoder</code>.</span>
          Decoupled Arrow IPC encoding from <code>std::io::Write</code> so asynchronous and chunk-oriented destinations can handle ordered buffers through their own I/O layer, while preserving the low-copy path; DataFusion later adopted it for asynchronous spill writes.
        </li>
        <li>
          <span class="lead">Restored valid schema-only Arrow IPC streams without an EOS marker.</span>
          Fixed <code>StreamDecoder</code>'s zero-length-body loop so it completes pending schema messages instead of dropping the schema and reporting <code>Unexpected End of Stream</code>, with regression coverage and no public API change.
        </li>
      </ul>
    </article>
  </section>
  <section class="topic-section" id="ebpf">
    <h2 class="section-title">eBPF Tracing</h2>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://github.com/bpftrace/bpftrace/pulls?q=is%3Apr+state%3Aclosed+author%3APhoenix500526">bpftrace</a></h3>
          <span class="scope">&middot; C++ / LLVM &middot; Linux tracing language</span>
        </div>
        <span class="role"><a href="https://github.com/orgs/bpftrace/teams/bpftrace-committers">Committer</a></span>
      </div>

      <div class="link-row period-right">
        <div>Jan. 2025 &ndash; Nov. 2025</div>
      </div>

      <p class="project-summary">
        bpftrace is the de facto high-level tracing DSL for Linux eBPF. Built on LLVM and libbpf, it is packaged by major Linux distributions and used by organizations for production tracing and debugging.
      </p>

      <ul>
        <li>
          <span class="lead">Moved bpftrace's USDT and uprobe attachment and discovery paths from BCC to libbpf.</span>
          Added USDT argument lifting and code generation, adopted libbpf attachment APIs, replaced BCC-based discovery with native ELF parsing, and resolved symbol shadowing, unifying these paths on the maintained libbpf ecosystem and enabling link-based kernel APIs.
        </li>
        <li>
          <span class="lead">Resolved mapped-binary paths through the target process's filesystem namespace root.</span>
          Enabled bpftrace to discover and attach userspace probes correctly when the traced process runs inside a container or another isolated filesystem namespace.
        </li>
        <li>
          <span class="lead">Replaced the ring-buffer event-loss counter's array map with a global variable.</span>
          Removed the map-lookup null checks and failure path required on older kernels, making loss accounting more reliable while simplifying the runtime path.
        </li>
      </ul>
    </article>

    <article class="contribution">
      <div class="contrib-head">
        <div>
          <h3 class="repo"><a href="https://docs.kernel.org/bpf/libbpf/libbpf_overview.html">Linux kernel / libbpf</a></h3>
          <span class="scope">&middot; C &middot; BPF userspace library</span>
        </div>
        <span class="role"><a href="https://git.kernel.org/pub/scm/linux/kernel/git/bpf/bpf-next.git/log/tools/lib/bpf?qt=grep&amp;q=Jiawei">Contributor</a></span>
      </div>

      <div class="link-row period-right">
        <div>May 2025 &ndash; Sep. 2025</div>
      </div>

      <p class="project-summary">
        libbpf is the C userspace library in the Linux kernel source tree for loading, verifying, and attaching BPF programs, with portability support through BPF CO-RE.
      </p>

      <ul>
        <li>
          <span class="lead">Fixed libbpf USDT attachment failures on GCC-optimized x86-64 binaries.</span>
          GCC emits Scale-Index-Base (SIB) operands for global-array access at <code>-O1</code> and above, including <code>-O2</code>; extended libbpf's parser and BPF-side argument model and added a deterministic inline-assembly kernel selftest, enabling <code>bpf_program__attach_usdt()</code> to handle optimized binaries correctly. The fix and regression coverage were merged into mainline Linux and released in Linux 6.18.
        </li>
      </ul>

      <div class="evidence">
        <span class="label">Mainline</span>
        <a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=758acb9ccfdbf854b55abaceaf1f3f229cde3d19">libbpf fix</a>
        &middot;
        <a href="https://github.com/torvalds/linux/commit/69424097ee1061280dce111ca43b7bc17868413c">kernel selftest</a>
        &middot;
        <a href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tag/?h=v6.18">Linux 6.18</a>
      </div>
    </article>
  </section>
{% endraw %}
