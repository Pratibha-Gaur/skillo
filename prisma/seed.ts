import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";
import { hash } from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const sqlite = createClient({ url: databaseUrl });
const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
await sqlite.executeMultiple(schema);
await sqlite.close();

const { db } = await import("../lib/db");

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const now = Date.now();
const ago = (milliseconds: number) => new Date(now - milliseconds);
const ahead = (milliseconds: number) => new Date(now + milliseconds);
const passwordHash = await hash("demo1234", 12);

const ids = {
  pratibha: "user_pratibha",
  maya: "user_maya",
  aarav: "user_aarav",
  rohan: "user_rohan",
  leena: "user_leena",
  kabir: "user_kabir",
  python: "skill_python",
  photography: "skill_photography",
  ui: "skill_ui_design",
  spanish: "skill_spanish",
  video: "skill_video_editing",
  excel: "skill_excel",
  publicSpeaking: "skill_public_speaking",
  guitar: "skill_guitar",
  sql: "skill_sql",
  cooking: "skill_cooking",
};

// The reset is intentionally explicit so the seed remains safe around foreign keys.
await db.$transaction([
  db.report.deleteMany(),
  db.notification.deleteMany(),
  db.message.deleteMany(),
  db.skillChainMember.deleteMany(),
  db.skillChain.deleteMany(),
  db.communityPost.deleteMany(),
  db.communityMember.deleteMany(),
  db.community.deleteMany(),
  db.skillEndorsement.deleteMany(),
  db.rating.deleteMany(),
  db.skillCreditTransaction.deleteMany(),
  db.sessionTask.deleteMany(),
  db.session.deleteMany(),
  db.progress.deleteMany(),
  db.learningPlanItem.deleteMany(),
  db.learningPlan.deleteMany(),
  db.exchangeProposal.deleteMany(),
  db.exchange.deleteMany(),
  db.skillFollow.deleteMany(),
  db.follow.deleteMany(),
  db.postReaction.deleteMany(),
  db.post.deleteMany(),
  db.learningGoal.deleteMany(),
  db.userSkill.deleteMany(),
  db.subSkill.deleteMany(),
  db.skill.deleteMany(),
  db.profile.deleteMany(),
  db.user.deleteMany(),
]);

await db.user.createMany({
  data: [
    {
      id: ids.pratibha,
      email: "demo@skillo.app",
      passwordHash,
      role: "USER",
      createdAt: ago(70 * day),
      updatedAt: ago(hour),
    },
    {
      id: ids.maya,
      email: "maya@skillo.app",
      passwordHash,
      role: "USER",
      createdAt: ago(95 * day),
      updatedAt: ago(2 * hour),
    },
    {
      id: ids.aarav,
      email: "aarav@skillo.app",
      passwordHash,
      role: "USER",
      createdAt: ago(50 * day),
      updatedAt: ago(4 * hour),
    },
    {
      id: ids.rohan,
      email: "rohan@skillo.app",
      passwordHash,
      role: "USER",
      createdAt: ago(40 * day),
      updatedAt: ago(5 * hour),
    },
    {
      id: ids.leena,
      email: "leena@skillo.app",
      passwordHash,
      role: "USER",
      createdAt: ago(120 * day),
      updatedAt: ago(day),
    },
    {
      id: ids.kabir,
      email: "kabir@skillo.app",
      passwordHash,
      role: "USER",
      createdAt: ago(30 * day),
      updatedAt: ago(day),
    },
  ],
});

await db.profile.createMany({
  data: [
    {
      id: "profile_pratibha",
      userId: ids.pratibha,
      name: "Pratibha Gaur",
      username: "pratibha",
      bio: "I build useful things with Python and I am learning to tell better stories through photographs.",
      location: "Delhi",
      avatarColor: "fern",
      platformLevel: "GROWING",
      onboardingComplete: true,
      reliability: 100,
      createdAt: ago(70 * day),
      updatedAt: ago(day),
    },
    {
      id: "profile_maya",
      userId: ids.maya,
      name: "Maya Kapoor",
      username: "mayak",
      bio: "Street photographer. Happy to help with composition, light, and getting comfortable behind a camera.",
      location: "Mumbai",
      avatarColor: "coral",
      platformLevel: "SKILLED",
      onboardingComplete: true,
      reliability: 96,
      createdAt: ago(95 * day),
      updatedAt: ago(2 * hour),
    },
    {
      id: "profile_aarav",
      userId: ids.aarav,
      name: "Aarav Sharma",
      username: "aarav",
      bio: "Spanish conversation partner and lifelong beginner at making things look good.",
      location: "Bengaluru",
      avatarColor: "sky",
      platformLevel: "GROWING",
      onboardingComplete: true,
      reliability: 98,
      createdAt: ago(50 * day),
      updatedAt: ago(4 * hour),
    },
    {
      id: "profile_rohan",
      userId: ids.rohan,
      name: "Rohan Mehta",
      username: "rohanm",
      bio: "Video editor focused on pacing, clean cuts, and small stories.",
      location: "Pune",
      avatarColor: "sun",
      platformLevel: "GROWING",
      onboardingComplete: true,
      reliability: 94,
      createdAt: ago(40 * day),
      updatedAt: ago(5 * hour),
    },
    {
      id: "profile_leena",
      userId: ids.leena,
      name: "Leena Thomas",
      username: "leenat",
      bio: "Data analyst who can make spreadsheets less intimidating.",
      location: "Kochi",
      avatarColor: "clay",
      platformLevel: "MENTOR",
      onboardingComplete: true,
      reliability: 99,
      createdAt: ago(120 * day),
      updatedAt: ago(day),
    },
    {
      id: "profile_kabir",
      userId: ids.kabir,
      name: "Kabir Singh",
      username: "kabirs",
      bio: "Guitar basics, patient practice, and songs you can play in a week.",
      location: "Chandigarh",
      avatarColor: "navy",
      platformLevel: "GROWING",
      onboardingComplete: true,
      reliability: 97,
      createdAt: ago(30 * day),
      updatedAt: ago(day),
    },
  ],
});

await db.skill.createMany({
  data: [
    {
      id: ids.python,
      name: "Python",
      slug: "python",
      category: "Technology",
      description:
        "Programming foundations, automation, and practical projects.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.photography,
      name: "Photography",
      slug: "photography",
      category: "Creative",
      description:
        "Composition, light, portraits, and everyday visual storytelling.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.ui,
      name: "UI Design",
      slug: "ui-design",
      category: "Design",
      description:
        "Clear interfaces, layout, hierarchy, and interaction design.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.spanish,
      name: "Spanish",
      slug: "spanish",
      category: "Languages",
      description: "Conversation, vocabulary, and practical everyday Spanish.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.video,
      name: "Video Editing",
      slug: "video-editing",
      category: "Creative",
      description: "Cuts, pacing, audio, and short-form storytelling.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.excel,
      name: "Excel",
      slug: "excel",
      category: "Business",
      description: "Formulas, clean data, dashboards, and useful workflows.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.publicSpeaking,
      name: "Public Speaking",
      slug: "public-speaking",
      category: "Communication",
      description: "Confidence, structure, delivery, and thoughtful feedback.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.guitar,
      name: "Guitar",
      slug: "guitar",
      category: "Music",
      description: "Chords, rhythm, practice habits, and beginner songs.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.sql,
      name: "SQL",
      slug: "sql",
      category: "Technology",
      description: "Queries, data modeling, joins, and analysis.",
      createdAt: ago(150 * day),
    },
    {
      id: ids.cooking,
      name: "Cooking",
      slug: "cooking",
      category: "Life skills",
      description: "Everyday techniques, flavor, and confident home cooking.",
      createdAt: ago(150 * day),
    },
  ],
});

await db.subSkill.createMany({
  data: [
    {
      id: "sub_py_basics",
      skillId: ids.python,
      name: "Basics",
      slug: "basics",
    },
    {
      id: "sub_py_auto",
      skillId: ids.python,
      name: "Automation",
      slug: "automation",
    },
    {
      id: "sub_photo_comp",
      skillId: ids.photography,
      name: "Composition",
      slug: "composition",
    },
    {
      id: "sub_photo_mobile",
      skillId: ids.photography,
      name: "Mobile Photography",
      slug: "mobile-photography",
    },
    {
      id: "sub_ui_hierarchy",
      skillId: ids.ui,
      name: "Visual Hierarchy",
      slug: "visual-hierarchy",
    },
    {
      id: "sub_spanish_conv",
      skillId: ids.spanish,
      name: "Conversation",
      slug: "conversation",
    },
  ],
});

await db.userSkill.createMany({
  data: [
    {
      id: "us_p_py",
      userId: ids.pratibha,
      skillId: ids.python,
      kind: "TEACH",
      level: "COMFORTABLE",
      subskills: "Basics,Automation",
      createdAt: ago(65 * day),
    },
    {
      id: "us_p_ui",
      userId: ids.pratibha,
      skillId: ids.ui,
      kind: "TEACH",
      level: "BASICS",
      subskills: "Visual Hierarchy",
      createdAt: ago(25 * day),
    },
    {
      id: "us_p_photo",
      userId: ids.pratibha,
      skillId: ids.photography,
      kind: "LEARN",
      level: "BASICS",
      subskills: "Composition,Mobile Photography",
      createdAt: ago(65 * day),
    },
    {
      id: "us_p_photo_current",
      userId: ids.pratibha,
      skillId: ids.photography,
      kind: "CURRENT",
      level: "BASICS",
      subskills: "Composition",
      createdAt: ago(12 * day),
    },
    {
      id: "us_p_spanish",
      userId: ids.pratibha,
      skillId: ids.spanish,
      kind: "LEARN",
      level: "BASICS",
      subskills: "Conversation",
      createdAt: ago(20 * day),
    },
    {
      id: "us_m_photo",
      userId: ids.maya,
      skillId: ids.photography,
      kind: "TEACH",
      level: "VERY_STRONG",
      subskills: "Composition,Street,Lighting",
      createdAt: ago(90 * day),
    },
    {
      id: "us_m_py",
      userId: ids.maya,
      skillId: ids.python,
      kind: "LEARN",
      level: "BASICS",
      subskills: "Basics",
      createdAt: ago(55 * day),
    },
    {
      id: "us_a_spanish",
      userId: ids.aarav,
      skillId: ids.spanish,
      kind: "TEACH",
      level: "COMFORTABLE",
      subskills: "Conversation,Vocabulary",
      createdAt: ago(45 * day),
    },
    {
      id: "us_a_ui",
      userId: ids.aarav,
      skillId: ids.ui,
      kind: "LEARN",
      level: "BASICS",
      subskills: "Visual Hierarchy",
      createdAt: ago(38 * day),
    },
    {
      id: "us_r_video",
      userId: ids.rohan,
      skillId: ids.video,
      kind: "TEACH",
      level: "VERY_STRONG",
      subskills: "Pacing,Short-form",
      createdAt: ago(35 * day),
    },
    {
      id: "us_r_spanish",
      userId: ids.rohan,
      skillId: ids.spanish,
      kind: "LEARN",
      level: "BASICS",
      subskills: "Conversation",
      createdAt: ago(20 * day),
    },
    {
      id: "us_l_excel",
      userId: ids.leena,
      skillId: ids.excel,
      kind: "TEACH",
      level: "VERY_STRONG",
      subskills: "Formulas,Dashboards",
      createdAt: ago(110 * day),
    },
    {
      id: "us_l_sql",
      userId: ids.leena,
      skillId: ids.sql,
      kind: "TEACH",
      level: "COMFORTABLE",
      subskills: "Queries,Joins",
      createdAt: ago(100 * day),
    },
    {
      id: "us_l_speaking",
      userId: ids.leena,
      skillId: ids.publicSpeaking,
      kind: "LEARN",
      level: "BASICS",
      subskills: "Delivery",
      createdAt: ago(30 * day),
    },
    {
      id: "us_k_guitar",
      userId: ids.kabir,
      skillId: ids.guitar,
      kind: "TEACH",
      level: "COMFORTABLE",
      subskills: "Chords,Rhythm",
      createdAt: ago(25 * day),
    },
    {
      id: "us_k_cooking",
      userId: ids.kabir,
      skillId: ids.cooking,
      kind: "LEARN",
      level: "BASICS",
      subskills: "Everyday meals",
      createdAt: ago(20 * day),
    },
  ],
});

await db.learningGoal.createMany({
  data: [
    {
      id: "goal_p_photo",
      userId: ids.pratibha,
      skillId: ids.photography,
      note: "Take stronger everyday photos without overthinking settings.",
      status: "ACTIVE",
      createdAt: ago(12 * day),
    },
    {
      id: "goal_p_spanish",
      userId: ids.pratibha,
      skillId: ids.spanish,
      note: "Hold a relaxed ten-minute conversation.",
      status: "OPEN",
      createdAt: ago(20 * day),
    },
  ],
});

await db.post.createMany({
  data: [
    {
      id: "post_maya_light",
      authorId: ids.maya,
      skillId: ids.photography,
      type: "TIP",
      content:
        "A simple composition exercise: choose one ordinary object and photograph it from five heights. The change in viewpoint matters more than the camera.",
      createdAt: ago(2 * hour),
      updatedAt: ago(2 * hour),
    },
    {
      id: "post_rohan_edit",
      authorId: ids.rohan,
      skillId: ids.video,
      type: "PROJECT",
      content:
        "Finished a 40-second neighborhood film using only hard cuts. Removing transitions made me pay much more attention to rhythm.",
      createdAt: ago(5 * hour),
      updatedAt: ago(5 * hour),
    },
    {
      id: "post_aarav_exchange",
      authorId: ids.aarav,
      skillId: ids.spanish,
      type: "EXCHANGE_REQUEST",
      content:
        "I can help with conversational Spanish and pronunciation. I would love to learn the basics of visual hierarchy from someone who designs interfaces.",
      createdAt: ago(9 * hour),
      updatedAt: ago(9 * hour),
    },
    {
      id: "post_leena_question",
      authorId: ids.leena,
      skillId: ids.publicSpeaking,
      type: "QUESTION",
      content:
        "How do you stop rushing through the first minute of a presentation? Looking for one practice technique I can repeat this week.",
      createdAt: ago(day),
      updatedAt: ago(day),
    },
    {
      id: "post_kabir_progress",
      authorId: ids.kabir,
      skillId: ids.guitar,
      type: "UPDATE",
      content:
        "Helped someone move between G and C without stopping today. Slowing the metronome down was the whole trick.",
      createdAt: ago(2 * day),
      updatedAt: ago(2 * day),
    },
  ],
});

await db.postReaction.createMany({
  data: [
    {
      id: "reaction_1",
      postId: "post_maya_light",
      userId: ids.pratibha,
      type: "HELPFUL",
      createdAt: ago(hour),
    },
    {
      id: "reaction_2",
      postId: "post_maya_light",
      userId: ids.aarav,
      type: "WANT_TO_LEARN",
      createdAt: ago(45 * 60 * 1000),
    },
    {
      id: "reaction_3",
      postId: "post_rohan_edit",
      userId: ids.maya,
      type: "INSPIRING",
      createdAt: ago(3 * hour),
    },
    {
      id: "reaction_4",
      postId: "post_aarav_exchange",
      userId: ids.rohan,
      type: "CAN_HELP",
      createdAt: ago(7 * hour),
    },
  ],
});

await db.follow.createMany({
  data: [
    {
      id: "follow_p_m",
      followerId: ids.pratibha,
      followingId: ids.maya,
      createdAt: ago(20 * day),
    },
    {
      id: "follow_p_l",
      followerId: ids.pratibha,
      followingId: ids.leena,
      createdAt: ago(10 * day),
    },
    {
      id: "follow_m_p",
      followerId: ids.maya,
      followingId: ids.pratibha,
      createdAt: ago(18 * day),
    },
  ],
});

await db.skillFollow.createMany({
  data: [
    {
      id: "sf_p_photo",
      userId: ids.pratibha,
      skillId: ids.photography,
      createdAt: ago(30 * day),
    },
    {
      id: "sf_p_spanish",
      userId: ids.pratibha,
      skillId: ids.spanish,
      createdAt: ago(20 * day),
    },
  ],
});

await db.exchange.createMany({
  data: [
    {
      id: "exchange_photo_python",
      proposerId: ids.pratibha,
      recipientId: ids.maya,
      teachSkillId: ids.python,
      learnSkillId: ids.photography,
      status: "ACTIVE",
      mode: "DIRECT",
      createdAt: ago(14 * day),
      updatedAt: ago(day),
    },
    {
      id: "exchange_spanish_ui",
      proposerId: ids.aarav,
      recipientId: ids.pratibha,
      teachSkillId: ids.spanish,
      learnSkillId: ids.ui,
      status: "PROPOSED",
      mode: "DIRECT",
      createdAt: ago(8 * hour),
      updatedAt: ago(8 * hour),
    },
    {
      id: "exchange_excel_python",
      proposerId: ids.leena,
      recipientId: ids.pratibha,
      teachSkillId: ids.excel,
      learnSkillId: ids.python,
      status: "COMPLETED",
      mode: "DIRECT",
      createdAt: ago(45 * day),
      updatedAt: ago(24 * day),
    },
  ],
});

await db.exchangeProposal.createMany({
  data: [
    {
      id: "proposal_photo_python",
      exchangeId: "exchange_photo_python",
      note: "Let us keep each session practical and end with one small thing to try.",
      sessionCount: 4,
      durationMinutes: 45,
      availability: "Saturday mornings",
      createdAt: ago(14 * day),
      updatedAt: ago(13 * day),
    },
    {
      id: "proposal_spanish_ui",
      exchangeId: "exchange_spanish_ui",
      note: "We could alternate a short Spanish conversation with a UI critique exercise.",
      sessionCount: 4,
      durationMinutes: 45,
      availability: "Weekday evenings",
      createdAt: ago(8 * hour),
      updatedAt: ago(8 * hour),
    },
    {
      id: "proposal_excel_python",
      exchangeId: "exchange_excel_python",
      note: "Two practical sessions in each direction.",
      sessionCount: 4,
      durationMinutes: 50,
      availability: "Sunday afternoons",
      createdAt: ago(45 * day),
      updatedAt: ago(45 * day),
    },
  ],
});

await db.learningPlan.createMany({
  data: [
    {
      id: "plan_photo_python",
      exchangeId: "exchange_photo_python",
      title: "Python ↔ Photography",
      proposerApprovedAt: ago(13 * day),
      recipientApprovedAt: ago(13 * day),
      createdAt: ago(13 * day),
      updatedAt: ago(3 * day),
    },
    {
      id: "plan_excel_python",
      exchangeId: "exchange_excel_python",
      title: "Excel ↔ Python",
      proposerApprovedAt: ago(44 * day),
      recipientApprovedAt: ago(44 * day),
      createdAt: ago(44 * day),
      updatedAt: ago(24 * day),
    },
  ],
});

await db.learningPlanItem.createMany({
  data: [
    {
      id: "plan_item_1",
      planId: "plan_photo_python",
      week: 1,
      title: "Foundations in both directions",
      description:
        "Python variables and functions. Photography composition and point of view.",
      side: "BOTH",
      status: "COMPLETED",
      sortOrder: 1,
      createdAt: ago(13 * day),
    },
    {
      id: "plan_item_2",
      planId: "plan_photo_python",
      week: 2,
      title: "One useful practice loop",
      description:
        "Automate a tiny task. Make a five-frame photo study using natural light.",
      side: "BOTH",
      status: "IN_PROGRESS",
      sortOrder: 2,
      createdAt: ago(13 * day),
    },
    {
      id: "plan_item_3",
      planId: "plan_photo_python",
      week: 3,
      title: "Make a small project",
      description:
        "Build a simple photo organizer and create a short visual story.",
      side: "BOTH",
      status: "NOT_STARTED",
      sortOrder: 3,
      createdAt: ago(13 * day),
    },
    {
      id: "plan_item_4",
      planId: "plan_photo_python",
      week: 4,
      title: "Review and teach it back",
      description:
        "Share what stuck, revisit one difficult idea, and choose a next step.",
      side: "BOTH",
      status: "NOT_STARTED",
      sortOrder: 4,
      createdAt: ago(13 * day),
    },
  ],
});

await db.session.createMany({
  data: [
    {
      id: "session_python_basics",
      exchangeId: "exchange_photo_python",
      teacherId: ids.pratibha,
      learnerId: ids.maya,
      title: "Python basics through a tiny script",
      durationMinutes: 48,
      scheduledFor: ago(9 * day),
      teacherCompletedAt: ago(9 * day),
      learnerConfirmedAt: ago(9 * day - hour),
      creditAwardedAt: ago(9 * day - hour),
      createdAt: ago(13 * day),
      updatedAt: ago(9 * day - hour),
    },
    {
      id: "session_composition",
      exchangeId: "exchange_photo_python",
      teacherId: ids.maya,
      learnerId: ids.pratibha,
      title: "Composition in everyday scenes",
      durationMinutes: 50,
      scheduledFor: ago(day),
      teacherCompletedAt: ago(20 * hour),
      learnerConfirmedAt: null,
      creditAwardedAt: null,
      createdAt: ago(7 * day),
      updatedAt: ago(20 * hour),
    },
    {
      id: "session_next",
      exchangeId: "exchange_photo_python",
      teacherId: ids.pratibha,
      learnerId: ids.maya,
      title: "Automate a repetitive task",
      durationMinutes: 45,
      scheduledFor: ahead(3 * day),
      teacherCompletedAt: null,
      learnerConfirmedAt: null,
      creditAwardedAt: null,
      createdAt: ago(3 * day),
      updatedAt: ago(3 * day),
    },
    {
      id: "session_old_python",
      exchangeId: "exchange_excel_python",
      teacherId: ids.pratibha,
      learnerId: ids.leena,
      title: "Python data cleanup",
      durationMinutes: 55,
      scheduledFor: ago(28 * day),
      teacherCompletedAt: ago(28 * day),
      learnerConfirmedAt: ago(28 * day - hour),
      creditAwardedAt: ago(28 * day - hour),
      createdAt: ago(40 * day),
      updatedAt: ago(28 * day - hour),
    },
  ],
});

await db.sessionTask.createMany({
  data: [
    {
      id: "task_comp_1",
      sessionId: "session_composition",
      title: "Choose five everyday subjects",
      status: "COMPLETED",
      createdAt: ago(3 * day),
    },
    {
      id: "task_comp_2",
      sessionId: "session_composition",
      title: "Try one high and one low viewpoint",
      status: "IN_PROGRESS",
      createdAt: ago(3 * day),
    },
    {
      id: "task_next_1",
      sessionId: "session_next",
      title: "Bring one repetitive computer task",
      status: "NOT_STARTED",
      createdAt: ago(3 * day),
    },
  ],
});

await db.progress.createMany({
  data: [
    {
      id: "progress_p_photo",
      userId: ids.pratibha,
      exchangeId: "exchange_photo_python",
      skillId: ids.photography,
      percent: 35,
      note: "Composition is starting to feel more deliberate.",
      updatedAt: ago(day),
    },
    {
      id: "progress_m_python",
      userId: ids.maya,
      exchangeId: "exchange_photo_python",
      skillId: ids.python,
      percent: 28,
      note: "Can now read and edit a small script.",
      updatedAt: ago(9 * day),
    },
  ],
});

await db.skillCreditTransaction.createMany({
  data: [
    {
      id: "credit_python_basics",
      userId: ids.pratibha,
      sessionId: "session_python_basics",
      amount: 1,
      type: "EARNED_TEACHING",
      reason: "Completed teaching session: Python basics",
      createdAt: ago(9 * day - hour),
    },
    {
      id: "credit_old_python",
      userId: ids.pratibha,
      sessionId: "session_old_python",
      amount: 1,
      type: "EARNED_TEACHING",
      reason: "Completed teaching session: Python data cleanup",
      createdAt: ago(28 * day - hour),
    },
    {
      id: "credit_spent",
      userId: ids.pratibha,
      sessionId: null,
      amount: -1,
      type: "SPENT_LEARNING",
      reason: "Learning session: Excel formulas",
      createdAt: ago(26 * day),
    },
  ],
});

await db.rating.createMany({
  data: [
    {
      id: "rating_leena_to_p",
      exchangeId: "exchange_excel_python",
      authorId: ids.leena,
      subjectId: ids.pratibha,
      teaching: 5,
      reliability: 5,
      communication: 5,
      helpfulness: 5,
      respect: 5,
      overall: 5,
      note: "Patient explanations and a useful example.",
      createdAt: ago(24 * day),
    },
    {
      id: "rating_p_to_leena",
      exchangeId: "exchange_excel_python",
      authorId: ids.pratibha,
      subjectId: ids.leena,
      teaching: 5,
      reliability: 5,
      communication: 4,
      helpfulness: 5,
      respect: 5,
      overall: 5,
      note: "Made formulas feel approachable.",
      createdAt: ago(24 * day),
    },
  ],
});

await db.skillEndorsement.createMany({
  data: [
    {
      id: "endorse_maya_photo_p",
      skillId: ids.photography,
      authorId: ids.pratibha,
      subjectId: ids.maya,
      createdAt: ago(5 * day),
    },
    {
      id: "endorse_p_python_l",
      skillId: ids.python,
      authorId: ids.leena,
      subjectId: ids.pratibha,
      createdAt: ago(24 * day),
    },
  ],
});

await db.community.createMany({
  data: [
    {
      id: "community_photo",
      creatorId: ids.maya,
      name: "Everyday Photography",
      slug: "everyday-photography",
      description:
        "Small prompts and practical feedback for people learning to see more carefully.",
      isPrivate: true,
      createdAt: ago(80 * day),
    },
    {
      id: "community_python",
      creatorId: ids.leena,
      name: "Python Beginners",
      slug: "python-beginners",
      description:
        "A calm place to ask first questions and find practice partners.",
      isPrivate: true,
      createdAt: ago(100 * day),
    },
    {
      id: "community_language",
      creatorId: ids.aarav,
      name: "Language Exchange",
      slug: "language-exchange",
      description:
        "Conversation practice and patient skill swaps across languages.",
      isPrivate: true,
      createdAt: ago(45 * day),
    },
  ],
});

await db.communityMember.createMany({
  data: [
    {
      id: "cm_p_photo",
      communityId: "community_photo",
      userId: ids.pratibha,
      role: "MEMBER",
      joinedAt: ago(18 * day),
    },
    {
      id: "cm_m_photo",
      communityId: "community_photo",
      userId: ids.maya,
      role: "CREATOR",
      joinedAt: ago(80 * day),
    },
    {
      id: "cm_p_python",
      communityId: "community_python",
      userId: ids.pratibha,
      role: "MEMBER",
      joinedAt: ago(40 * day),
    },
    {
      id: "cm_l_python",
      communityId: "community_python",
      userId: ids.leena,
      role: "CREATOR",
      joinedAt: ago(100 * day),
    },
  ],
});

await db.skillChain.create({
  data: {
    id: "chain_creative",
    communityId: "community_photo",
    name: "Code to creative",
    status: "FORMING",
    createdAt: ago(6 * day),
  },
});
await db.skillChainMember.createMany({
  data: [
    {
      id: "chain_1",
      chainId: "chain_creative",
      userId: ids.pratibha,
      skillId: ids.python,
      position: 1,
      createdAt: ago(6 * day),
    },
    {
      id: "chain_2",
      chainId: "chain_creative",
      userId: ids.maya,
      skillId: ids.photography,
      position: 2,
      createdAt: ago(6 * day),
    },
    {
      id: "chain_3",
      chainId: "chain_creative",
      userId: ids.rohan,
      skillId: ids.video,
      position: 3,
      createdAt: ago(5 * day),
    },
    {
      id: "chain_4",
      chainId: "chain_creative",
      userId: ids.aarav,
      skillId: ids.ui,
      position: 4,
      createdAt: ago(4 * day),
    },
  ],
});

await db.message.createMany({
  data: [
    {
      id: "msg_1",
      senderId: ids.maya,
      receiverId: ids.pratibha,
      exchangeId: "exchange_photo_python",
      content:
        "Your five-frame exercise had a much clearer point of view. Which frame felt most like yours?",
      readAt: ago(3 * hour),
      createdAt: ago(4 * hour),
    },
    {
      id: "msg_2",
      senderId: ids.pratibha,
      receiverId: ids.maya,
      exchangeId: "exchange_photo_python",
      content:
        "The third one. Moving lower made the scene feel completely different.",
      readAt: ago(2 * hour),
      createdAt: ago(3 * hour),
    },
    {
      id: "msg_3",
      senderId: ids.maya,
      receiverId: ids.pratibha,
      exchangeId: "exchange_photo_python",
      content:
        "That is the one I would choose too. Let us start there next time.",
      readAt: null,
      createdAt: ago(90 * 60 * 1000),
    },
    {
      id: "msg_4",
      senderId: ids.aarav,
      receiverId: ids.pratibha,
      exchangeId: "exchange_spanish_ui",
      content:
        "Hi! I sketched a simple four-session exchange. Feel free to change the timing.",
      readAt: null,
      createdAt: ago(7 * hour),
    },
  ],
});

await db.notification.createMany({
  data: [
    {
      id: "notif_exchange",
      userId: ids.pratibha,
      type: "EXCHANGE_REQUEST",
      title: "Aarav proposed an exchange",
      body: "Spanish ↔ UI Design",
      href: "/exchanges",
      readAt: null,
      createdAt: ago(8 * hour),
    },
    {
      id: "notif_session",
      userId: ids.pratibha,
      type: "SESSION_COMPLETE",
      title: "Maya marked your session complete",
      body: "Confirm the composition session when you are ready.",
      href: "/exchanges/exchange_photo_python",
      readAt: null,
      createdAt: ago(20 * hour),
    },
    {
      id: "notif_reaction",
      userId: ids.pratibha,
      type: "REACTION",
      title: "Leena found your post helpful",
      body: "A small sign that your note helped someone.",
      href: "/home",
      readAt: ago(day),
      createdAt: ago(2 * day),
    },
    {
      id: "notif_milestone",
      userId: ids.pratibha,
      type: "MILESTONE",
      title: "Your first exchange is complete",
      body: "You taught Python and learned a practical Excel workflow.",
      href: "/profile/pratibha",
      readAt: ago(20 * day),
      createdAt: ago(24 * day),
    },
  ],
});

console.log("Skillo demo data is ready.");
console.log("Demo sign in: demo@skillo.app / demo1234");
await db.$disconnect();
