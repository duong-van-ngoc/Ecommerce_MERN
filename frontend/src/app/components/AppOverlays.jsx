import AIChatBubble from "@/features/chat/components/AIChatBubble";

function AppOverlays() {
  return (
    <>
      {/* UserDashboard moved to Navbar to prevent overlap issues */}
      <AIChatBubble />
    </>
  );
}

export default AppOverlays;
