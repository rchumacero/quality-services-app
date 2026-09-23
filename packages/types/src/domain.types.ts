export interface BaseAuditFields {
  createdAt: string | Date;
  createdBy: string;
  updatedAt?: string | Date | null;
  updatedBy?: string | null;
  status: string;
}

export interface BrandModel extends BaseAuditFields {
  id: string;
  code: string;
  name: string;
  proceduresSummary: string;
}

export interface UserModel extends BaseAuditFields {
  id: string;
  account: string;
  name: string;
  role: string;
}

export interface BrandUserModel extends BaseAuditFields {
  id: string;
  brandId: string;
  userId: string;
  brand?: BrandModel;
  user?: UserModel;
}

export interface ReplyModel extends BaseAuditFields {
  id: string;
  brandId: string;
  specialistId: string;
  replyDate: string | Date;
  content: string;
  brand?: BrandModel;
  specialist?: UserModel;
  evaluations?: EvaluationModel[];
}

export interface EvaluationModel extends BaseAuditFields {
  id: string;
  replyId: string;
  teamLeadId: string;
  evaluationDate: string | Date;
  score: number;
  errorTags?: string | null;
  feedback?: string | null;
  reply?: ReplyModel;
  teamLead?: UserModel;
}
