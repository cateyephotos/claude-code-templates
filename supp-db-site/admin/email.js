/**
 * Email Sequences Admin Panel
 * Uses the existing Convex client (window.convex) and Clerk auth from admin/index.html.
 *
 * Sub-views: Sequences List | Sequence Editor | Analytics
 */

(function () {
  "use strict";

  // ── State ────────────────────────────────────────────────────
  let currentView = "list"; // "list" | "editor" | "analytics"
  let currentSequenceId = null;
  let sequenceData = null;
  let sequencesListData = [];

  const app = document.getElementById("email-app");
  if (!app) return;

  // ── Convex Client Wrapper ────────────────────────────────────
  function getClient() {
    return window.convex;
  }

  async function queryConvex(fnName, args = {}) {
    const client = getClient();
    if (!client) throw new Error("Convex client not available");
    return client.query(fnName, args);
  }

  async function mutateConvex(fnName, args = {}) {
    const client = getClient();
    if (!client) throw new Error("Convex client not available");
    return client.mutation(fnName, args);
  }

  // ── Render Router ────────────────────────────────────────────
  function render() {
    switch (currentView) {
      case "list":
        renderSequencesList();
        break;
      case "editor":
        renderSequenceEditor();
        break;
      case "analytics":
        renderAnalytics();
        break;
    }
  }

  // ── Sequences List View ──────────────────────────────────────
  async function renderSequencesList() {
    app.innerHTML = `
      <div class="email-container">
        <div class="email-header">
          <h2>Email Sequences</h2>
          <button class="email-btn email-btn--primary" onclick="emailApp.createNew()">
            <i class="fas fa-plus"></i> New Sequence
          </button>
        </div>
        <div class="email-subnav">
          <button class="email-subnav-btn active" data-view="list">Sequences</button>
          <button class="email-subnav-btn" data-view="analytics">Analytics</button>
        </div>
        <div id="email-list-content">
          <p style="color:#888;text-align:center;padding:2rem;">Loading sequences...</p>
        </div>
      </div>
    `;

    // Bind subnav
    app.querySelectorAll(".email-subnav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.view === "analytics") {
          currentView = "analytics";
          render();
        }
      });
    });

    try {
      sequencesListData = await queryConvex("emailSequences:listSequences");
      const container = document.getElementById("email-list-content");

      if (sequencesListData.length === 0) {
        container.innerHTML = `
          <div style="text-align:center;padding:3rem;color:#888;">
            <i class="fas fa-envelope-open" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>
            <p>No email sequences yet. Create your first one to get started.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <table class="email-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Steps</th>
              <th>Active Subscribers</th>
              <th>Trigger</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            ${sequencesListData.map((seq) => `
              <tr data-id="${seq._id}">
                <td style="font-weight:500;">${escapeHtml(seq.name)}</td>
                <td><span class="email-badge email-badge--${seq.status}">${seq.status}</span></td>
                <td>${seq.stepCount}</td>
                <td>${seq.activeSubscriberCount}</td>
                <td style="font-size:0.8rem;color:#666;">${formatTrigger(seq.trigger)}</td>
                <td style="font-size:0.8rem;color:#888;">${formatDate(seq.updatedAt)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      // Bind row clicks
      container.querySelectorAll("tr[data-id]").forEach((row) => {
        row.addEventListener("click", () => {
          currentSequenceId = row.dataset.id;
          currentView = "editor";
          render();
        });
      });
    } catch (err) {
      document.getElementById("email-list-content").innerHTML =
        `<p style="color:#c62828;padding:1rem;">Error loading sequences: ${escapeHtml(err.message)}</p>`;
    }
  }

  // ── Sequence Editor View ─────────────────────────────────────
  async function renderSequenceEditor() {
    app.innerHTML = `
      <div class="email-container">
        <div class="email-header">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.backToList()">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <h2 id="editor-title">${currentSequenceId ? "Edit Sequence" : "New Sequence"}</h2>
          </div>
        </div>
        <div id="editor-content">
          <p style="color:#888;text-align:center;padding:2rem;">Loading...</p>
        </div>
      </div>
    `;

    if (currentSequenceId) {
      try {
        sequenceData = await queryConvex("emailSequences:getSequence", { sequenceId: currentSequenceId });
        if (!sequenceData) {
          document.getElementById("editor-content").innerHTML = `<p style="color:#c62828;">Sequence not found.</p>`;
          return;
        }
      } catch (err) {
        document.getElementById("editor-content").innerHTML = `<p style="color:#c62828;">Error: ${escapeHtml(err.message)}</p>`;
        return;
      }
    } else {
      sequenceData = {
        name: "",
        description: "",
        trigger: { type: "both", event: "email_opt_in" },
        status: "draft",
        sendTime: { hour: 9, minute: 0, timezone: "America/New_York" },
        excludeDays: ["saturday", "sunday"],
        maxDeferHours: 48,
        steps: [],
      };
    }

    renderEditorForm();
  }

  function renderEditorForm() {
    const seq = sequenceData;
    const isNew = !currentSequenceId;
    const steps = seq.steps || [];

    const editorHtml = `
      <div class="email-editor">
        <!-- Metadata -->
        <div class="email-editor-section">
          <h3>Sequence Details</h3>
          <div class="email-form-group">
            <label class="email-label">Name</label>
            <input class="email-input" id="seq-name" value="${escapeAttr(seq.name)}" placeholder="Welcome Sequence">
          </div>
          <div class="email-form-group">
            <label class="email-label">Description</label>
            <textarea class="email-textarea" id="seq-description" rows="2" placeholder="What this sequence does...">${escapeHtml(seq.description)}</textarea>
          </div>
          ${!isNew ? `<div class="email-form-group">
            <label class="email-label">Status</label>
            <span class="email-badge email-badge--${seq.status}">${seq.status}</span>
          </div>` : ""}
        </div>

        <!-- Trigger -->
        <div class="email-editor-section">
          <h3>Trigger</h3>
          <div class="email-form-group">
            <label class="email-label">Trigger Type</label>
            <select class="email-select" id="seq-trigger-type">
              <option value="both" ${seq.trigger.type === "both" ? "selected" : ""}>Event + Manual</option>
              <option value="event" ${seq.trigger.type === "event" ? "selected" : ""}>Event Only</option>
              <option value="manual" ${seq.trigger.type === "manual" ? "selected" : ""}>Manual Only</option>
            </select>
          </div>
          <div class="email-form-group" id="trigger-event-group" ${seq.trigger.type === "manual" ? 'style="display:none"' : ""}>
            <label class="email-label">Event</label>
            <select class="email-select" id="seq-trigger-event">
              <option value="email_opt_in" ${seq.trigger.event === "email_opt_in" ? "selected" : ""}>Email Opt-In</option>
              <option value="pdf_purchase" ${seq.trigger.event === "pdf_purchase" ? "selected" : ""}>PDF Purchase</option>
              <option value="pro_signup" ${seq.trigger.event === "pro_signup" ? "selected" : ""}>Pro Signup</option>
            </select>
          </div>
        </div>

        <!-- Scheduling -->
        <div class="email-editor-section">
          <h3>Smart Scheduling</h3>
          <div style="display:grid;grid-template-columns:auto auto auto auto;gap:0.75rem;align-items:end;">
            <div class="email-form-group">
              <label class="email-label">Hour</label>
              <select class="email-select" id="seq-hour">
                ${Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                  const val24 = seq.sendTime.hour;
                  const displayH = val24 > 12 ? val24 - 12 : val24 === 0 ? 12 : val24;
                  return `<option value="${h}" ${displayH === h ? "selected" : ""}>${h}</option>`;
                }).join("")}
              </select>
            </div>
            <div class="email-form-group">
              <label class="email-label">AM/PM</label>
              <select class="email-select" id="seq-ampm">
                <option value="AM" ${seq.sendTime.hour < 12 ? "selected" : ""}>AM</option>
                <option value="PM" ${seq.sendTime.hour >= 12 ? "selected" : ""}>PM</option>
              </select>
            </div>
            <div class="email-form-group">
              <label class="email-label">Timezone</label>
              <select class="email-select" id="seq-timezone">
                <option value="America/New_York" ${seq.sendTime.timezone === "America/New_York" ? "selected" : ""}>Eastern</option>
                <option value="America/Chicago" ${seq.sendTime.timezone === "America/Chicago" ? "selected" : ""}>Central</option>
                <option value="America/Denver" ${seq.sendTime.timezone === "America/Denver" ? "selected" : ""}>Mountain</option>
                <option value="America/Los_Angeles" ${seq.sendTime.timezone === "America/Los_Angeles" ? "selected" : ""}>Pacific</option>
              </select>
            </div>
            <div class="email-form-group">
              <label class="email-label">Max Defer (hrs)</label>
              <input class="email-input" id="seq-max-defer" type="number" value="${seq.maxDeferHours}" min="1" max="168" style="width:80px;">
            </div>
          </div>
          <div class="email-form-group" style="margin-top:0.75rem;">
            <label class="email-label">Exclude Days</label>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
              ${["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => `
                <label style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;cursor:pointer;">
                  <input type="checkbox" class="exclude-day" value="${day}" ${seq.excludeDays.includes(day) ? "checked" : ""}>
                  ${day.charAt(0).toUpperCase() + day.slice(1, 3)}
                </label>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Steps -->
        <div class="email-editor-section">
          <h3>Email Steps</h3>
          <div id="steps-container">
            ${steps.map((step, i) => renderStepCard(step, i)).join("")}
          </div>
          <button class="email-btn email-btn--secondary" style="margin-top:0.75rem;" onclick="emailApp.addStep()">
            <i class="fas fa-plus"></i> Add Step
          </button>
        </div>

        <!-- Action Bar -->
        <div class="email-action-bar">
          <button class="email-btn email-btn--secondary" onclick="emailApp.sendTest()">
            <i class="fas fa-paper-plane"></i> Send Test Email
          </button>
          ${!isNew && seq.status === "draft" ? `
            <button class="email-btn email-btn--danger email-btn--sm" onclick="emailApp.deleteSequence()">
              <i class="fas fa-trash"></i> Delete
            </button>
          ` : ""}
          <button class="email-btn email-btn--secondary" onclick="emailApp.save('draft')">
            Save Draft
          </button>
          <button class="email-btn email-btn--primary" onclick="emailApp.save('activate')">
            <i class="fas fa-check"></i> Save &amp; Activate
          </button>
        </div>
      </div>
    `;

    document.getElementById("editor-content").innerHTML = editorHtml;

    // Bind trigger type change
    document.getElementById("seq-trigger-type").addEventListener("change", (e) => {
      const eventGroup = document.getElementById("trigger-event-group");
      eventGroup.style.display = e.target.value === "manual" ? "none" : "";
    });
  }

  function renderStepCard(step, index) {
    const isDisabled = step.status === "disabled";
    return `
      <div class="email-step-card ${isDisabled ? "email-step-card--disabled" : ""}" data-step-id="${step._id || ""}" data-index="${index}">
        <div class="email-step-header">
          <span class="email-step-number">Step ${index + 1}</span>
          <div class="email-step-actions">
            <select class="email-select" style="width:auto;font-size:0.75rem;" onchange="emailApp.toggleStep('${step._id}', this.value)">
              <option value="active" ${!isDisabled ? "selected" : ""}>Active</option>
              <option value="disabled" ${isDisabled ? "selected" : ""}>Disabled</option>
            </select>
            <button class="email-btn email-btn--danger email-btn--sm" onclick="emailApp.removeStep('${step._id}', ${index})">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:0.75rem;margin-bottom:0.75rem;">
          <div class="email-form-group">
            <label class="email-label">Delay</label>
            <div style="display:flex;align-items:center;gap:0.3rem;">
              <input class="email-input step-delay" type="number" value="${step.delayDays}" min="0" style="width:60px;">
              <span style="font-size:0.75rem;color:#888;">days</span>
            </div>
          </div>
          <div class="email-form-group">
            <label class="email-label">Subject</label>
            <input class="email-input step-subject" value="${escapeAttr(step.subject)}" placeholder="Email subject...">
          </div>
        </div>
        <div class="email-form-group">
          <label class="email-label">Preheader</label>
          <input class="email-input step-preheader" value="${escapeAttr(step.preheader)}" placeholder="Preview text...">
        </div>
        <div class="email-form-group">
          <label class="email-label">Body Blocks</label>
          <div class="step-blocks" data-step-index="${index}">
            ${(step.bodyBlocks || []).map((block, bi) => renderBlockEditor(block, bi, index)).join("")}
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.addBlock(${index}, 'text')">+ Text</button>
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.addBlock(${index}, 'cta')">+ CTA</button>
            <button class="email-btn email-btn--secondary email-btn--sm" onclick="emailApp.addBlock(${index}, 'divider')">+ Divider</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderBlockEditor(block, blockIndex, stepIndex) {
    if (block.type === "text") {
      return `<div class="email-block" data-block-index="${blockIndex}">
        <div class="email-block-type">Text <button class="email-btn email-btn--danger email-btn--sm" style="float:right;padding:0.1rem 0.3rem;" onclick="emailApp.removeBlock(${stepIndex}, ${blockIndex})"><i class="fas fa-times" style="font-size:0.6rem;"></i></button></div>
        <textarea class="email-textarea block-content" rows="3" placeholder="Write your email content... Use {{variable}} for dynamic values.">${escapeHtml(block.content || "")}</textarea>
      </div>`;
    }
    if (block.type === "cta") {
      return `<div class="email-block" data-block-index="${blockIndex}">
        <div class="email-block-type">CTA Button <button class="email-btn email-btn--danger email-btn--sm" style="float:right;padding:0.1rem 0.3rem;" onclick="emailApp.removeBlock(${stepIndex}, ${blockIndex})"><i class="fas fa-times" style="font-size:0.6rem;"></i></button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <input class="email-input block-label" value="${escapeAttr(block.label || "")}" placeholder="Button Label">
          <input class="email-input block-url" value="${escapeAttr(block.url || "")}" placeholder="https://...">
        </div>
      </div>`;
    }
    if (block.type === "divider") {
      return `<div class="email-block" data-block-index="${blockIndex}">
        <div class="email-block-type">Divider <button class="email-btn email-btn--danger email-btn--sm" style="float:right;padding:0.1rem 0.3rem;" onclick="emailApp.removeBlock(${stepIndex}, ${blockIndex})"><i class="fas fa-times" style="font-size:0.6rem;"></i></button></div>
        <hr style="border:none;border-top:1px dashed #ddd;">
      </div>`;
    }
    return "";
  }

  // ── Editor Actions ───────────────────────────────────────────

  function gatherSequenceFormData() {
    const hourSelect = document.getElementById("seq-hour");
    const ampmSelect = document.getElementById("seq-ampm");
    let hour24 = parseInt(hourSelect.value);
    if (ampmSelect.value === "PM" && hour24 !== 12) hour24 += 12;
    if (ampmSelect.value === "AM" && hour24 === 12) hour24 = 0;

    const excludeDays = Array.from(document.querySelectorAll(".exclude-day:checked")).map((cb) => cb.value);

    return {
      name: document.getElementById("seq-name").value.trim(),
      description: document.getElementById("seq-description").value.trim(),
      trigger: {
        type: document.getElementById("seq-trigger-type").value,
        event: document.getElementById("seq-trigger-type").value !== "manual"
          ? document.getElementById("seq-trigger-event").value
          : undefined,
      },
      sendTime: {
        hour: hour24,
        minute: 0,
        timezone: document.getElementById("seq-timezone").value,
      },
      excludeDays,
      maxDeferHours: parseInt(document.getElementById("seq-max-defer").value) || 48,
    };
  }

  function gatherStepsData() {
    const stepCards = document.querySelectorAll(".email-step-card");
    const steps = [];

    stepCards.forEach((card) => {
      const blocks = [];
      card.querySelectorAll(".email-block").forEach((block) => {
        const contentEl = block.querySelector(".block-content");
        const labelEl = block.querySelector(".block-label");
        const urlEl = block.querySelector(".block-url");

        if (contentEl) {
          blocks.push({ type: "text", content: contentEl.value });
        } else if (labelEl) {
          blocks.push({ type: "cta", label: labelEl.value, url: urlEl.value });
        } else {
          blocks.push({ type: "divider" });
        }
      });

      steps.push({
        _id: card.dataset.stepId || null,
        delayDays: parseInt(card.querySelector(".step-delay").value) || 0,
        subject: card.querySelector(".step-subject").value,
        preheader: card.querySelector(".step-preheader").value,
        bodyBlocks: blocks,
        status: card.querySelector("select").value || "active",
      });
    });

    return steps;
  }

  async function saveSequence(activate) {
    const formData = gatherSequenceFormData();
    if (!formData.name) {
      alert("Sequence name is required.");
      return;
    }

    try {
      let seqId = currentSequenceId;

      if (!seqId) {
        // Create new sequence
        seqId = await mutateConvex("emailSequences:createSequence", {
          name: formData.name,
          description: formData.description,
          trigger: formData.trigger,
        });
        currentSequenceId = seqId;
      }

      // Update sequence fields
      const updateArgs = {
        sequenceId: seqId,
        ...formData,
      };
      if (activate) {
        updateArgs.status = "active";
      }
      await mutateConvex("emailSequences:updateSequence", updateArgs);

      // Save steps
      const stepsData = gatherStepsData();
      for (const step of stepsData) {
        if (step._id) {
          // Update existing step
          await mutateConvex("emailSequences:updateStep", {
            stepId: step._id,
            subject: step.subject,
            preheader: step.preheader,
            bodyBlocks: step.bodyBlocks,
            delayDays: step.delayDays,
            status: step.status,
          });
        } else {
          // Create new step
          await mutateConvex("emailSequences:createStep", {
            sequenceId: seqId,
            subject: step.subject,
            preheader: step.preheader,
            bodyBlocks: step.bodyBlocks,
            delayDays: step.delayDays,
          });
        }
      }

      alert(activate ? "Sequence saved and activated!" : "Sequence saved as draft.");
      currentView = "editor";
      render();
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  }

  // ── Analytics View (placeholder - added in Task 16) ─────────
  async function renderAnalytics() {
    app.innerHTML = `
      <div class="email-container">
        <div class="email-header"><h2>Email Analytics</h2></div>
        <div class="email-subnav">
          <button class="email-subnav-btn" data-view="list">Sequences</button>
          <button class="email-subnav-btn active" data-view="analytics">Analytics</button>
        </div>
        <p style="color:#888;text-align:center;padding:3rem;">Analytics view loading in next update...</p>
      </div>
    `;
    app.querySelectorAll(".email-subnav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.view === "list") { currentView = "list"; render(); }
      });
    });
  }

  // ── Utility Functions ────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatTrigger(trigger) {
    if (!trigger) return "—";
    const type = trigger.type === "both" ? "Event + Manual" : trigger.type === "event" ? "Event" : "Manual";
    const event = trigger.event ? ` (${trigger.event.replace(/_/g, " ")})` : "";
    return type + event;
  }

  function formatDate(ts) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // ── Public API (exposed to onclick handlers) ─────────────────

  window.emailApp = {
    createNew: () => { currentSequenceId = null; currentView = "editor"; render(); },
    backToList: () => { currentView = "list"; render(); },
    save: (mode) => saveSequence(mode === "activate"),
    deleteSequence: async () => {
      if (!confirm("Delete this sequence? This cannot be undone.")) return;
      try {
        await mutateConvex("emailSequences:deleteSequence", { sequenceId: currentSequenceId });
        currentView = "list";
        render();
      } catch (err) {
        alert("Error: " + err.message);
      }
    },
    addStep: () => {
      const steps = sequenceData.steps || [];
      steps.push({
        _id: null,
        stepIndex: steps.length,
        subject: "",
        preheader: "",
        bodyBlocks: [{ type: "text", content: "" }],
        delayDays: steps.length === 0 ? 0 : 2,
        status: "active",
      });
      sequenceData.steps = steps;
      renderEditorForm();
    },
    removeStep: async (stepId, index) => {
      if (!confirm("Remove this step?")) return;
      if (stepId) {
        try {
          await mutateConvex("emailSequences:deleteStep", { stepId });
        } catch (err) {
          alert("Error: " + err.message);
          return;
        }
      }
      sequenceData.steps.splice(index, 1);
      renderEditorForm();
    },
    toggleStep: async (stepId, status) => {
      if (stepId) {
        try {
          await mutateConvex("emailSequences:updateStep", { stepId, status });
        } catch (err) {
          alert("Error: " + err.message);
        }
      }
    },
    addBlock: (stepIndex, type) => {
      const block = type === "text" ? { type: "text", content: "" }
        : type === "cta" ? { type: "cta", label: "", url: "" }
          : { type: "divider" };
      sequenceData.steps[stepIndex].bodyBlocks.push(block);
      renderEditorForm();
    },
    removeBlock: (stepIndex, blockIndex) => {
      sequenceData.steps[stepIndex].bodyBlocks.splice(blockIndex, 1);
      renderEditorForm();
    },
    sendTest: async () => {
      if (!currentSequenceId) {
        alert("Save the sequence first, then send a test.");
        return;
      }
      const client = getClient();
      if (!client) { alert("Convex client not available."); return; }
      try {
        const adminEmail = await queryConvex("emailSequences:getAdminEmail");
        if (!adminEmail) {
          alert("Could not resolve admin email from Clerk session.");
          return;
        }
        if (!confirm(`Send test email to ${adminEmail}?`)) return;
        await mutateConvex("emailSequences:sendTestEmail", {
          sequenceId: currentSequenceId,
          recipientEmail: adminEmail,
        });
        alert(`Test email sent to ${adminEmail}`);
      } catch (err) {
        alert("Error: " + err.message);
      }
    },
    enrollModal: () => {
      alert("Manual enrollment modal coming in next update.");
    },
  };

  // ── Initialize on section activation ─────────────────────────
  const observer = new MutationObserver(() => {
    const section = document.getElementById("section-email");
    if (section && section.classList.contains("active")) {
      render();
    }
  });

  const section = document.getElementById("section-email");
  if (section) {
    observer.observe(section, { attributes: true, attributeFilter: ["class"] });
    if (section.classList.contains("active")) {
      render();
    }
  }

  // Handle hash navigation
  if (window.location.hash === "#email") {
    const navBtn = document.querySelector('[data-section="email"]');
    if (navBtn) navBtn.click();
  }
})();
