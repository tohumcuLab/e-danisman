import { prisma } from "./prisma";

export const SCORE_RULES = {
  ANSWER: 10,
  LIKE: 3,
  BEST_ANSWER: 20,
  ADMIN_HIGHLIGHT: 15,
  SPAM: -20,
  WRONG_INFO: -50,
};

export type ScoreAction = keyof typeof SCORE_RULES;

export async function getActionPoints(action: ScoreAction): Promise<number> {
  const settingKey = `EXPERT_SCORE_${action}`;
  const setting = await prisma.systemSetting.findUnique({
    where: { key: settingKey },
  });

  if (setting && !isNaN(parseInt(setting.value, 10))) {
    return parseInt(setting.value, 10);
  }

  // Soru yanıtlama için geriye dönük uyumluluk kontrolü (Legacy key)
  if (action === "ANSWER") {
    const legacySetting = await prisma.systemSetting.findUnique({
      where: { key: "EXPERT_ANSWER_POINT_VALUE" },
    });
    if (legacySetting && !isNaN(parseInt(legacySetting.value, 10))) {
      return parseInt(legacySetting.value, 10);
    }
  }

  return SCORE_RULES[action];
}

export async function addExpertScore(expertId: string, action: ScoreAction, relatedId?: string) {
  // 1. Kullanıcı gerçekten uzman mı kontrolü
  const expert = await prisma.user.findUnique({ where: { id: expertId } });
  if (!expert || expert.role !== "EXPERT") return;

  const points = await getActionPoints(action);

  // 3. Log Oluştur
  await prisma.expertScoreLog.create({
    data: {
      expertId,
      action,
      points,
      relatedId,
    },
  });
}

export async function removeExpertScore(expertId: string, action: ScoreAction, relatedId?: string) {
  // Örneğin beğeni geri çekildiğinde veya cevap silindiğinde
  const points = -(await getActionPoints(action));
  
  await prisma.expertScoreLog.create({
    data: {
      expertId,
      action: `${action}_REVERT`, // Logda ayırt edebilmek için
      points,
      relatedId,
    },
  });
}
