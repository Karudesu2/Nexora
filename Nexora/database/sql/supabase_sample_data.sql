-- NEXORA production demo data
-- Run only after supabase_update_before_push.sql in the Supabase SQL Editor.
-- This is idempotent: it inserts missing demo records and never deletes data.

begin;

-- The schema bootstrap creates this account. It is used only as the owner of
-- demonstration records, so no additional production user is created here.
with demo_teacher as (
    select id from users where email = 'testteacher@nexora.test' limit 1
), context as (
    select sy.id as school_year_id, t.id as term_id, g.id as grade_id, s.id as subject_id
    from school_years sy
    join terms t on t.school_year_id = sy.id and t.name = 'First Term'
    join grades g on g.name = 'Grade 7'
    join subjects s on s.code = 'MATH'
    where sy.name = '2026-2027'
    limit 1
)
insert into curriculum_versions (name, code, description, effective_date, is_active, created_at, updated_at)
select 'MATATAG Curriculum', 'MATATAG-2026', 'Sample curriculum mapping for the NEXORA production demonstration.', '2026-06-01', true, now(), now()
where not exists (select 1 from curriculum_versions where code = 'MATATAG-2026');

with context as (
    select sy.id as school_year_id, t.id as term_id, g.id as grade_id, s.id as subject_id
    from school_years sy join terms t on t.school_year_id = sy.id and t.name = 'First Term'
    join grades g on g.name = 'Grade 7' join subjects s on s.code = 'MATH'
    where sy.name = '2026-2027' limit 1
), curriculum as (select id from curriculum_versions where code = 'MATATAG-2026')
insert into competencies (curriculum_version_id, grade_id, subject_id, term_id, code, description, learning_area, created_at, updated_at)
select curriculum.id, context.grade_id, context.subject_id, context.term_id, 'G7-MATH-Q1-01', 'Represents and compares rational numbers in real-world contexts.', 'Mathematics', now(), now()
from context cross join curriculum
on conflict (curriculum_version_id, grade_id, subject_id, term_id, code) do nothing;

with demo_teacher as (select id from users where email = 'testteacher@nexora.test' limit 1)
insert into system_announcements (created_by, title, message, type, priority, starts_at, is_active, created_at, updated_at)
select id, 'Welcome to NEXORA', 'The lesson planning workspace is ready. Start with a template or create a lesson plan.', 'Update', 'Normal', now(), true, now(), now()
from demo_teacher
where not exists (select 1 from system_announcements where title = 'Welcome to NEXORA');

with demo_teacher as (select id from users where email = 'testteacher@nexora.test' limit 1)
insert into lesson_templates (user_id, title, category, description, structure, is_public, created_at, updated_at)
select id, 'Grade 7 Mathematics – Daily Lesson Log', 'Daily Lesson Log',
       'A reusable Grade 7 Mathematics lesson structure with guided practice and reflection.',
       '{"lessonIntroduction":"Review prerequisite skills and introduce a contextual problem.","learningActivities":"Model the concept, facilitate collaborative practice, then check understanding.","assessment":"Use a short exit ticket with one reasoning question.","teacherReflection":"Record learner misconceptions and the next instructional step."}'::jsonb,
       true, now(), now()
from demo_teacher
where not exists (select 1 from lesson_templates where title = 'Grade 7 Mathematics – Daily Lesson Log');

with demo_teacher as (select id from users where email = 'testteacher@nexora.test' limit 1), context as (
    select sy.id as school_year_id, t.id as term_id, g.id as grade_id, s.id as subject_id
    from school_years sy join terms t on t.school_year_id = sy.id and t.name = 'First Term'
    join grades g on g.name = 'Grade 7' join subjects s on s.code = 'MATH'
    where sy.name = '2026-2027' limit 1
)
insert into lessons (teacher_id, school_year_id, term_id, grade_id, subject_id, section, title, lesson_date, status, content, plan_data, created_at, updated_at)
select demo_teacher.id, context.school_year_id, context.term_id, context.grade_id, context.subject_id,
       'Rizal', 'Comparing Rational Numbers', '2026-09-22', 'Draft',
       'Review prerequisite skills. Present rational numbers on a number line. Guide learners through paired comparisons, then collect an exit ticket.',
       '{"objectives":"Compare and order rational numbers using a number line.","learningActivities":"Number-line modeling, paired practice, exit ticket."}'::jsonb,
       now(), now()
from demo_teacher cross join context
where not exists (select 1 from lessons where title = 'Comparing Rational Numbers' and lesson_date = '2026-09-22');

with demo_teacher as (select id from users where email = 'testteacher@nexora.test' limit 1)
insert into notifications (user_id, title, message, type, action_url, created_at, updated_at)
select id, 'Your sample lesson is ready', 'Open the Lesson Planner to review the sample Grade 7 Mathematics lesson.', 'lesson', '/lessons', now(), now()
from demo_teacher
where not exists (select 1 from notifications where title = 'Your sample lesson is ready');

commit;
