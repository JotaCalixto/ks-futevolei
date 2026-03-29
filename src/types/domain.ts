// Tipos de domínio — gerados na Fase 1
// Cole aqui o conteúdo de FASE_1_PLANEJAMENTO.md seção "5. Tipos TypeScript"
export type UserRole = 'student' | 'coach' | 'super_admin'
export type SlotStatus = 'open' | 'closed' | 'cancelled'
export type BookingStatus = 'confirmed' | 'cancelled' | 'no_show' | 'attended'
export type MembershipStatus = 'active' | 'due_soon' | 'overdue' | 'inactive' | 'trial'
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'waived'
export type MessageType = 'text' | 'image' | 'system'
export type NotificationType =
  | 'booking_created' | 'booking_cancelled' | 'waitlist_promoted'
  | 'new_message' | 'membership_due' | 'membership_overdue'
  | 'new_announcement' | 'slot_opened' | 'slot_closed' | 'attendance_marked'
export type AnnouncementScope = 'all' | 'slot' | 'day'

// Interfaces completas no FASE_1_PLANEJAMENTO.md
export interface Profile { id: string; academyId: string | null; role: UserRole; fullName: string; phone: string; avatarUrl: string | null; onesignalId: string | null; fcmToken: string | null; isActive: boolean; lastSeenAt: string | null; createdAt: string; updatedAt: string }
export interface Coach { id: string; profileId: string; academyId: string; bio: string | null; certifications: string[]; specialties: string[]; defaultCapacity: number; cancelPolicy: string; isAccepting: boolean; createdAt: string; updatedAt: string; profile?: Profile }
export interface Student { id: string; profileId: string; academyId: string; coachId: string | null; emergencyContact: string | null; birthDate: string | null; notes: string | null; totalAttendances: number; joinedAt: string; isActive: boolean; createdAt: string; updatedAt: string; profile?: Profile; currentMembership?: Membership | null }
export interface TrainingDay { id: string; academyId: string; coachId: string; date: string; isOpen: boolean; observation: string | null; theme: string | null; createdAt: string; updatedAt: string; slots?: TrainingSlot[] }
export interface TrainingSlot { id: string; trainingDayId: string; academyId: string; coachId: string; startTime: string; endTime: string; capacity: number; bookedCount: number; status: SlotStatus; observation: string | null; location: string; createdAt: string; updatedAt: string; availableSpots: number; isFull: boolean }
export interface Booking { id: string; slotId: string; studentId: string; academyId: string; status: BookingStatus; bookedAt: string; cancelledAt: string | null; cancelReason: string | null; notes: string | null; createdAt: string; updatedAt: string; slot?: TrainingSlot; student?: Student }
export interface WaitlistEntry { id: string; slotId: string; studentId: string; academyId: string; position: number; joinedAt: string; notifiedAt: string | null; promotedAt: string | null; isActive: boolean }
export interface Membership { id: string; studentId: string; academyId: string; coachId: string; referenceMonth: string; dueDate: string; amount: number; status: PaymentStatus; paidAt: string | null; paymentMethod: string | null; receiptUrl: string | null; notes: string | null; createdAt: string; updatedAt: string; membershipStatus: MembershipStatus; daysUntilDue: number; isOverdue: boolean; isDueSoon: boolean }
export interface Message { id: string; academyId: string; senderId: string; receiverId: string; content: string; type: MessageType; relatedSlotId: string | null; isRead: boolean; readAt: string | null; createdAt: string; sender?: Profile; receiver?: Profile }
export interface Announcement { id: string; academyId: string; coachId: string; title: string; content: string; scope: AnnouncementScope; slotId: string | null; dayDate: string | null; isPinned: boolean; expiresAt: string | null; createdAt: string; updatedAt: string }
export interface Notification { id: string; userId: string; academyId: string; type: NotificationType; title: string; body: string; data: Record<string, unknown>; isRead: boolean; readAt: string | null; pushSent: boolean; pushSentAt: string | null; createdAt: string }
export interface Academy { id: string; name: string; slug: string; logoUrl: string | null; primaryColor: string; city: string | null; state: string; phone: string | null; instagram: string | null; description: string | null; settings: Record<string, unknown>; isActive: boolean; createdAt: string; updatedAt: string }
export interface DashboardStats { totalStudents: number; activeStudents: number; todaySlots: number; todayBookings: number; todayCapacity: number; pendingPayments: number; overduePayments: number; unreadMessages: number; occupancyRate: number }
export interface SlotWithContext extends TrainingSlot { dayObservation: string | null; dayTheme: string | null; dayDate: string; isToday: boolean; isPast: boolean; userBooking: Booking | null; userWaitlistPosition: number | null }
export interface CreateBookingResponse { success: boolean; booking?: Booking; waitlistEntry?: WaitlistEntry; waitlistPosition?: number; waitlist?: boolean; position?: number; message: string }
export interface AuthUser { id: string; profile: Profile; student?: Student; coach?: Coach; academy: Academy }
