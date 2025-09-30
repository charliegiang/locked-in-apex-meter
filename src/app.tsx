import { createSignal, onMount, type Component } from "solid-js";

const LockinMeter: Component = () => {
  const [lockinLevel, setLockinLevel] = createSignal(50);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [statusMessage, setStatusMessage] = createSignal("");
  const [statusType, setStatusType] = createSignal<"success" | "error" | "">(
    ""
  );

  const getMeterColor = () => {
    const level = lockinLevel();
    if (level < 30) return "text-red-500";
    if (level < 70) return "text-orange-500";
    return "text-green-500";
  };

  const getColorForLevel = (level: number): number => {
    if (level < 30) return 16711680; // Red
    if (level < 70) return 16753920; // Orange
    return 5371990; // Green
  };

  const getStatusText = (level: number): string => {
    if (level < 20) return "😴 Barely awake";
    if (level < 40) return "🎮 Warming up";
    if (level < 60) return "💪 Getting focused";
    if (level < 80) return "🔥 In the zone";
    if (level < 95) return "⚡ Ultra locked in";
    return "🏆 MAXIMUM LOCK-IN";
  };

  const getNotificationMessage = (level: number): string => {
    if (level < 20) return "❌ Yeah, we're not rising.";
    if (level > 90) return "✅ Get me in there! We're locked in!";
    return "❌ You better lock tf in... I'm already tilted.";
  };

  const showStatus = (message: string, type: "success" | "error") => {
    setStatusMessage(message);
    setStatusType(type);

    setTimeout(() => {
      setStatusMessage("");
      setStatusType("");
    }, 5000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/.netlify/functions/send-discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: getNotificationMessage(lockinLevel()),
          embeds: [
            {
              title: "🎮 Alan's Locked In Meter - Apex Legends",
              description: `**Locked In Level: ${lockinLevel()}/100**`,
              color: getColorForLevel(lockinLevel()),
              fields: [
                {
                  name: "Status",
                  value: getStatusText(lockinLevel()),
                  inline: true,
                },
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: "Apex Legends Tracker",
              },
            },
          ],
        }),
      });

      if (response.ok) {
        const notificationMsg = getNotificationMessage(lockinLevel());
        showStatus(`${notificationMsg}`, "success");
      } else {
        showStatus("❌ Failed to send. Check your webhook URL.", "error");
      }
    } catch (error) {
      showStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="container">
      <h1>🎮 Alan's Locked In Meter</h1>
      <p class="subtitle">Apex Legends</p>

      <div class="meter-display">
        <div class={`meter-value ${getMeterColor()}`}>{lockinLevel()}</div>
        <div class="meter-label">Locked In Level</div>
      </div>

      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={lockinLevel()}
          onInput={(e) => setLockinLevel(parseInt(e.currentTarget.value))}
          class="slider"
        />
        <div class="slider-labels">
          <span>😴 Not Locked In</span>
          <span>🔥 Ultra Locked In</span>
        </div>
      </div>

      <button
        class="submit-btn"
        onClick={handleSubmit}
        disabled={isSubmitting()}
      >
        {isSubmitting() ? "Sending..." : "Submit to Charlie"}
      </button>

      {statusMessage() && (
        <div class={`status-message ${statusType()}`}>{statusMessage()}</div>
      )}
    </div>
  );
};

export default LockinMeter;
