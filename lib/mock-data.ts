export const mockDashboardKpis = [
  {
    label: "Total users",
    value: "12.4k",
    badge: "+5%",
    tone: "success" as const,
    helper: "Growth vs previous 30 days"
  },
  {
    label: "New users today",
    value: "142",
    badge: "Trending",
    tone: "info" as const,
    helper: "Verified rate 94%"
  },
  {
    label: "Pending moderation",
    value: "28",
    tone: "review" as const,
    helper: "High-priority queue items surfaced first"
  },
  {
    label: "Pending reports",
    value: "12",
    tone: "danger" as const,
    helper: "Separate module scheduled for Sprint 2"
  }
];

export const mockModerationRows = [
  {
    postId: "#PX-8842",
    author: "Marcus Chen",
    reason: "Potential spam pattern",
    status: "Pending",
    time: "14m ago",
    tone: "review" as const
  },
  {
    postId: "#PX-8839",
    author: "Elena Rodriguez",
    reason: "Offensive language",
    status: "Reviewed",
    time: "42m ago",
    tone: "success" as const
  },
  {
    postId: "#PX-8831",
    author: "James Wilson",
    reason: "Copyright violation",
    status: "Pending",
    time: "1h ago",
    tone: "warning" as const
  }
];

