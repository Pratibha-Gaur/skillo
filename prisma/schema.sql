PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Profile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "bio" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "avatarColor" TEXT NOT NULL DEFAULT 'fern',
  "platformLevel" TEXT NOT NULL DEFAULT 'GROWING',
  "onboardingComplete" INTEGER NOT NULL DEFAULT 0,
  "reliability" INTEGER NOT NULL DEFAULT 100,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_username_key" ON "Profile"("username");

CREATE TABLE IF NOT EXISTS "Skill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "createdAt" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Skill_slug_key" ON "Skill"("slug");

CREATE TABLE IF NOT EXISTS "SubSkill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "skillId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  CONSTRAINT "SubSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SubSkill_skillId_slug_key" ON "SubSkill"("skillId", "slug");

CREATE TABLE IF NOT EXISTS "UserSkill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "level" TEXT NOT NULL DEFAULT 'BASICS',
  "subskills" TEXT NOT NULL DEFAULT '',
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserSkill_userId_skillId_kind_key" ON "UserSkill"("userId", "skillId", "kind");
CREATE INDEX IF NOT EXISTS "UserSkill_kind_skillId_idx" ON "UserSkill"("kind", "skillId");

CREATE TABLE IF NOT EXISTS "LearningGoal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "LearningGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "LearningGoal_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Post" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "skillId" TEXT,
  "type" TEXT NOT NULL DEFAULT 'UPDATE',
  "content" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Post_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt");

CREATE TABLE IF NOT EXISTS "PostReaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'HELPFUL',
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
  CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PostReaction_postId_userId_key" ON "PostReaction"("postId", "userId");

CREATE TABLE IF NOT EXISTS "Follow" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

CREATE TABLE IF NOT EXISTS "SkillFollow" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "SkillFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "SkillFollow_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SkillFollow_userId_skillId_key" ON "SkillFollow"("userId", "skillId");

CREATE TABLE IF NOT EXISTS "Exchange" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "proposerId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "teachSkillId" TEXT NOT NULL,
  "learnSkillId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "mode" TEXT NOT NULL DEFAULT 'DIRECT',
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  CONSTRAINT "Exchange_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id"),
  CONSTRAINT "Exchange_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id"),
  CONSTRAINT "Exchange_teachSkillId_fkey" FOREIGN KEY ("teachSkillId") REFERENCES "Skill"("id"),
  CONSTRAINT "Exchange_learnSkillId_fkey" FOREIGN KEY ("learnSkillId") REFERENCES "Skill"("id")
);
CREATE INDEX IF NOT EXISTS "Exchange_proposerId_status_idx" ON "Exchange"("proposerId", "status");
CREATE INDEX IF NOT EXISTS "Exchange_recipientId_status_idx" ON "Exchange"("recipientId", "status");

CREATE TABLE IF NOT EXISTS "ExchangeProposal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "exchangeId" TEXT NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "sessionCount" INTEGER NOT NULL DEFAULT 4,
  "durationMinutes" INTEGER NOT NULL DEFAULT 45,
  "availability" TEXT NOT NULL DEFAULT '',
  "privateDeclineReason" TEXT NOT NULL DEFAULT '',
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  CONSTRAINT "ExchangeProposal_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ExchangeProposal_exchangeId_key" ON "ExchangeProposal"("exchangeId");

CREATE TABLE IF NOT EXISTS "LearningPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "exchangeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "proposerApprovedAt" TEXT,
  "recipientApprovedAt" TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  CONSTRAINT "LearningPlan_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "LearningPlan_exchangeId_key" ON "LearningPlan"("exchangeId");

CREATE TABLE IF NOT EXISTS "LearningPlanItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "week" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "side" TEXT NOT NULL DEFAULT 'BOTH',
  "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "LearningPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "LearningPlanItem_planId_sortOrder_idx" ON "LearningPlanItem"("planId", "sortOrder");

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "exchangeId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "learnerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 45,
  "scheduledFor" TEXT,
  "teacherCompletedAt" TEXT,
  "learnerConfirmedAt" TEXT,
  "creditAwardedAt" TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  CONSTRAINT "Session_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE CASCADE,
  CONSTRAINT "Session_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id"),
  CONSTRAINT "Session_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "SessionTask" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "SessionTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Progress" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "exchangeId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "percent" INTEGER NOT NULL DEFAULT 0,
  "note" TEXT NOT NULL DEFAULT '',
  "updatedAt" TEXT NOT NULL,
  CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Progress_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE CASCADE,
  CONSTRAINT "Progress_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Progress_userId_exchangeId_skillId_key" ON "Progress"("userId", "exchangeId", "skillId");

CREATE TABLE IF NOT EXISTS "SkillCreditTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT,
  "amount" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "SkillCreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "SkillCreditTransaction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SkillCreditTransaction_sessionId_key" ON "SkillCreditTransaction"("sessionId");
CREATE INDEX IF NOT EXISTS "SkillCreditTransaction_userId_createdAt_idx" ON "SkillCreditTransaction"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "Rating" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "exchangeId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "teaching" INTEGER NOT NULL,
  "reliability" INTEGER NOT NULL,
  "communication" INTEGER NOT NULL,
  "helpfulness" INTEGER NOT NULL,
  "respect" INTEGER NOT NULL,
  "overall" INTEGER NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "Rating_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE CASCADE,
  CONSTRAINT "Rating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id"),
  CONSTRAINT "Rating_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Rating_exchangeId_authorId_key" ON "Rating"("exchangeId", "authorId");

CREATE TABLE IF NOT EXISTS "SkillEndorsement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "skillId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "SkillEndorsement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE,
  CONSTRAINT "SkillEndorsement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id"),
  CONSTRAINT "SkillEndorsement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SkillEndorsement_skillId_authorId_subjectId_key" ON "SkillEndorsement"("skillId", "authorId", "subjectId");

CREATE TABLE IF NOT EXISTS "Community" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "creatorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "isPrivate" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "Community_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Community_slug_key" ON "Community"("slug");

CREATE TABLE IF NOT EXISTS "CommunityMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "communityId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TEXT NOT NULL,
  CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE,
  CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");

CREATE TABLE IF NOT EXISTS "CommunityPost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "communityId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "CommunityPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "SkillChain" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "communityId" TEXT,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'FORMING',
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "SkillChain_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "SkillChainMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "chainId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "SkillChainMember_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "SkillChain"("id") ON DELETE CASCADE,
  CONSTRAINT "SkillChainMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "SkillChainMember_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SkillChainMember_chainId_position_key" ON "SkillChainMember"("chainId", "position");
CREATE UNIQUE INDEX IF NOT EXISTS "SkillChainMember_chainId_userId_key" ON "SkillChainMember"("chainId", "userId");

CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "exchangeId" TEXT,
  "content" TEXT NOT NULL,
  "readAt" TEXT,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Message_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "Message_senderId_receiverId_createdAt_idx" ON "Message"("senderId", "receiverId", "createdAt");

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "href" TEXT NOT NULL DEFAULT '',
  "readAt" TEXT,
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TEXT NOT NULL,
  CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
);
