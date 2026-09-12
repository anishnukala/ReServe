export interface Rescue {
  id: string;
  donationId: string;
  recipientOrgId: string;
  donorUserId?: string | null;
  status: "ACCEPTED" | "PICKED_UP" | "DELIVERED";
  acceptedAt: string;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  quantityRescued: number;
}
