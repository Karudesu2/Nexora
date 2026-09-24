-- NEXORA Supabase SQL update before push/sync
-- Run this in the LOCAL Supabase SQL Editor first. Apply to production only
-- after local verification and an explicit production deployment decision.
-- This app uses Laravel authentication tables, not Supabase Auth's auth.users.

begin;

create table if not exists migrations (
    id serial primary key,
    migration varchar(255) not null,
    batch integer not null
);

create table if not exists users (
    id bigserial primary key,
    name varchar(255) not null,
    email varchar(255) not null unique,
    email_verified_at timestamp null,
    password varchar(255) not null,
    remember_token varchar(100) null,
    first_name varchar(255) null,
    middle_name varchar(255) null,
    last_name varchar(255) null,
    is_active boolean not null default true,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists password_reset_tokens (
    email varchar(255) primary key,
    token varchar(255) not null,
    created_at timestamp null
);

create table if not exists sessions (
    id varchar(255) primary key,
    user_id bigint null,
    ip_address varchar(45) null,
    user_agent text null,
    payload text not null,
    last_activity integer not null
);
create index if not exists sessions_user_id_index on sessions (user_id);
create index if not exists sessions_last_activity_index on sessions (last_activity);

create table if not exists cache (
    key varchar(255) primary key,
    value text not null,
    expiration bigint not null
);
create index if not exists cache_expiration_index on cache (expiration);

create table if not exists cache_locks (
    key varchar(255) primary key,
    owner varchar(255) not null,
    expiration bigint not null
);
create index if not exists cache_locks_expiration_index on cache_locks (expiration);

create table if not exists jobs (
    id bigserial primary key,
    queue varchar(255) not null,
    payload text not null,
    attempts smallint not null,
    reserved_at integer null,
    available_at integer not null,
    created_at integer not null
);
create index if not exists jobs_queue_index on jobs (queue);

create table if not exists job_batches (
    id varchar(255) primary key,
    name varchar(255) not null,
    total_jobs integer not null,
    pending_jobs integer not null,
    failed_jobs integer not null,
    failed_job_ids text not null,
    options text null,
    cancelled_at integer null,
    created_at integer not null,
    finished_at integer null
);

create table if not exists failed_jobs (
    id bigserial primary key,
    uuid varchar(255) not null unique,
    connection varchar(255) not null,
    queue varchar(255) not null,
    payload text not null,
    exception text not null,
    failed_at timestamp not null default current_timestamp
);
create index if not exists failed_jobs_connection_queue_failed_at_index on failed_jobs (connection, queue, failed_at);

create table if not exists roles (
    id bigserial primary key,
    name varchar(255) not null,
    code varchar(255) not null unique,
    description text null,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists role_user (
    id bigserial primary key,
    role_id bigint not null references roles(id) on delete cascade,
    user_id bigint not null references users(id) on delete cascade,
    created_at timestamp null,
    updated_at timestamp null,
    unique(role_id, user_id)
);

create table if not exists personal_access_tokens (
    id bigserial primary key,
    tokenable_type varchar(255) not null,
    tokenable_id bigint not null,
    name text not null,
    token varchar(64) not null unique,
    abilities text null,
    last_used_at timestamp null,
    expires_at timestamp null,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists personal_access_tokens_tokenable_type_tokenable_id_index on personal_access_tokens (tokenable_type, tokenable_id);
create index if not exists personal_access_tokens_expires_at_index on personal_access_tokens (expires_at);

create table if not exists notifications (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    title varchar(255) not null,
    message text not null,
    type varchar(255) null,
    read_at timestamp null,
    action_url text null,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists notifications_user_id_read_at_index on notifications (user_id, read_at);

create table if not exists system_announcements (
    id bigserial primary key,
    created_by bigint null references users(id) on delete set null,
    title varchar(255) not null,
    message text not null,
    type varchar(40) not null default 'Update',
    priority varchar(40) not null default 'Normal',
    starts_at timestamp null,
    ends_at timestamp null,
    is_active boolean not null default true,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists system_announcements_is_active_starts_at_ends_at_index on system_announcements (is_active, starts_at, ends_at);

create table if not exists school_years (
    id bigserial primary key,
    name varchar(255) not null,
    start_date date not null,
    end_date date not null,
    is_active boolean not null default false,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists terms (
    id bigserial primary key,
    school_year_id bigint not null references school_years(id) on delete cascade,
    name varchar(255) not null,
    start_date date not null,
    end_date date not null,
    is_active boolean not null default false,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists grades (
    id bigserial primary key,
    name varchar(255) not null,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists subjects (
    id bigserial primary key,
    name varchar(255) not null,
    code varchar(255) null,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists curriculum_versions (
    id bigserial primary key,
    name varchar(255) not null,
    code varchar(255) null,
    description text null,
    effective_date date null,
    is_active boolean not null default false,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists competencies (
    id bigserial primary key,
    curriculum_version_id bigint not null references curriculum_versions(id) on delete cascade,
    grade_id bigint not null references grades(id) on delete cascade,
    subject_id bigint not null references subjects(id) on delete cascade,
    term_id bigint not null references terms(id) on delete cascade,
    code varchar(255) not null,
    description text not null,
    learning_area varchar(255) null,
    created_at timestamp null,
    updated_at timestamp null,
    unique(curriculum_version_id, grade_id, subject_id, term_id, code)
);

create table if not exists lessons (
    id bigserial primary key,
    teacher_id bigint not null references users(id) on delete cascade,
    school_year_id bigint not null references school_years(id) on delete cascade,
    term_id bigint not null references terms(id) on delete cascade,
    grade_id bigint not null references grades(id) on delete cascade,
    subject_id bigint not null references subjects(id) on delete cascade,
    section varchar(255) not null,
    title varchar(255) not null,
    lesson_date date not null,
    status varchar(255) not null default 'Draft',
    content text null,
    differentiation text null,
    plan_data jsonb null,
    source_file_name varchar(255) null,
    source_file_path varchar(255) null,
    source_file_mime varchar(255) null,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists lessons_teacher_id_lesson_date_index on lessons (teacher_id, lesson_date);
create index if not exists lessons_school_year_id_term_id_lesson_date_index on lessons (school_year_id, term_id, lesson_date);

alter table lessons add column if not exists differentiation text null;
alter table lessons add column if not exists plan_data jsonb null;
alter table lessons add column if not exists source_file_name varchar(255) null;
alter table lessons add column if not exists source_file_path varchar(255) null;
alter table lessons add column if not exists source_file_mime varchar(255) null;

-- Repair columns introduced after the original tables may already exist.
alter table users add column if not exists first_name varchar(255) null;
alter table users add column if not exists middle_name varchar(255) null;
alter table users add column if not exists last_name varchar(255) null;
alter table users add column if not exists is_active boolean not null default true;
alter table school_years add column if not exists is_active boolean not null default false;
alter table terms add column if not exists is_active boolean not null default false;
alter table resources add column if not exists type varchar(255) null;
alter table resources add column if not exists is_public boolean not null default false;
alter table assessments add column if not exists assessment_date date null;

create table if not exists lesson_versions (
    id bigserial primary key,
    lesson_id bigint not null references lessons(id) on delete cascade,
    user_id bigint not null references users(id) on delete cascade,
    version_number integer not null,
    title varchar(255) not null,
    status varchar(255) not null default 'Draft',
    content text null,
    plan_data jsonb null,
    created_at timestamp null,
    updated_at timestamp null,
    unique(lesson_id, version_number)
);
create index if not exists lesson_versions_lesson_id_created_at_index on lesson_versions (lesson_id, created_at);

create table if not exists lesson_templates (
    id bigserial primary key,
    user_id bigint null references users(id) on delete set null,
    title varchar(255) not null,
    category varchar(120) null,
    description text null,
    structure jsonb null,
    is_public boolean not null default false,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists lesson_templates_user_id_is_public_index on lesson_templates (user_id, is_public);

create table if not exists feedback_reports (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    category varchar(80) not null,
    priority varchar(40) not null default 'Medium',
    status varchar(40) not null default 'Submitted',
    title varchar(255) not null,
    description text not null,
    affected_module varchar(255) null,
    steps_to_reproduce text null,
    suggested_solution text null,
    system_information text null,
    attachment_path text null,
    attachment_name varchar(255) null,
    attachment_mime varchar(255) null,
    resolved_by bigint null references users(id) on delete set null,
    resolved_at timestamp null,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists feedback_reports_user_id_created_at_index on feedback_reports (user_id, created_at);
create index if not exists feedback_reports_category_priority_status_index on feedback_reports (category, priority, status);

create table if not exists feedback_updates (
    id bigserial primary key,
    feedback_report_id bigint not null references feedback_reports(id) on delete cascade,
    user_id bigint null references users(id) on delete set null,
    status varchar(40) null,
    message text not null,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists feedback_updates_feedback_report_id_created_at_index on feedback_updates (feedback_report_id, created_at);

create table if not exists lesson_objectives (
    id bigserial primary key,
    lesson_id bigint not null references lessons(id) on delete cascade,
    objective text not null,
    sort_order integer not null default 1,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists lesson_objectives_lesson_id_sort_order_index on lesson_objectives (lesson_id, sort_order);

create table if not exists lesson_activities (
    id bigserial primary key,
    lesson_id bigint not null references lessons(id) on delete cascade,
    title varchar(255) not null,
    description text null,
    activity_type varchar(255) null,
    duration_minutes integer null,
    sort_order integer not null default 1,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists lesson_resources (
    id bigserial primary key,
    lesson_id bigint not null references lessons(id) on delete cascade,
    resource_id bigint null,
    name varchar(255) not null,
    type varchar(255) null,
    url text null,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists lesson_reflections (
    id bigserial primary key,
    lesson_id bigint not null unique references lessons(id) on delete cascade,
    what_went_well text null,
    challenges text null,
    student_learning text null,
    next_steps text null,
    teacher_notes text null,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists competency_mappings (
    id bigserial primary key,
    lesson_id bigint not null references lessons(id) on delete cascade,
    competency_id bigint not null references competencies(id) on delete cascade,
    alignment_score numeric(5,2) null,
    notes text null,
    created_at timestamp null,
    updated_at timestamp null,
    unique(lesson_id, competency_id)
);

create table if not exists teacher_assignments (
    id bigserial primary key,
    teacher_id bigint not null references users(id) on delete cascade,
    school_year_id bigint not null references school_years(id) on delete cascade,
    term_id bigint not null references terms(id) on delete cascade,
    grade_id bigint not null references grades(id) on delete cascade,
    subject_id bigint not null references subjects(id) on delete cascade,
    section varchar(255) not null,
    created_at timestamp null,
    updated_at timestamp null,
    unique(teacher_id, school_year_id, term_id, grade_id, subject_id, section)
);

create table if not exists teacher_schedules (
    id bigserial primary key,
    teacher_assignment_id bigint not null references teacher_assignments(id) on delete cascade,
    day_of_week varchar(255) not null,
    start_time time not null,
    end_time time not null,
    room varchar(255) null,
    created_at timestamp null,
    updated_at timestamp null,
    unique(teacher_assignment_id, day_of_week, start_time, end_time)
);

create table if not exists calendar_events (
    id bigserial primary key,
    school_year_id bigint not null references school_years(id) on delete cascade,
    term_id bigint null references terms(id) on delete set null,
    title varchar(255) not null,
    type varchar(255) not null,
    start_date date not null,
    end_date date null,
    description text null,
    is_instructional_day boolean not null default false,
    is_approved boolean not null default true,
    created_at timestamp null,
    updated_at timestamp null
);

do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_schema = current_schema() and table_name = 'calendar_events' and column_name = 'event_date'
    ) and not exists (
        select 1 from information_schema.columns
        where table_schema = current_schema() and table_name = 'calendar_events' and column_name = 'start_date'
    ) then
        alter table calendar_events rename column event_date to start_date;
    end if;

    if exists (
        select 1 from information_schema.columns
        where table_schema = current_schema() and table_name = 'calendar_events' and column_name = 'event_type'
    ) and not exists (
        select 1 from information_schema.columns
        where table_schema = current_schema() and table_name = 'calendar_events' and column_name = 'type'
    ) then
        alter table calendar_events rename column event_type to type;
    end if;
end $$;

alter table calendar_events add column if not exists type varchar(255) null;
alter table calendar_events add column if not exists start_date date null;
alter table calendar_events add column if not exists end_date date null;
alter table calendar_events add column if not exists description text null;
alter table calendar_events add column if not exists is_instructional_day boolean not null default false;
alter table calendar_events add column if not exists is_approved boolean not null default true;
create index if not exists calendar_events_school_year_id_start_date_end_date_index on calendar_events (school_year_id, start_date, end_date);

create table if not exists assessments (
    id bigserial primary key,
    lesson_id bigint not null references lessons(id) on delete cascade,
    title varchar(255) not null,
    type varchar(255) null,
    description text null,
    total_points numeric(8,2) null,
    assessment_date date null,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists assessment_competencies (
    id bigserial primary key,
    assessment_id bigint not null references assessments(id) on delete cascade,
    competency_id bigint not null references competencies(id) on delete cascade,
    created_at timestamp null,
    updated_at timestamp null,
    unique(assessment_id, competency_id)
);

create table if not exists resources (
    id bigserial primary key,
    teacher_id bigint null references users(id) on delete set null,
    name varchar(255) not null,
    type varchar(255) null,
    description text null,
    file_path text null,
    external_url text null,
    is_public boolean not null default false,
    created_at timestamp null,
    updated_at timestamp null
);

create table if not exists pacing_records (
    id bigserial primary key,
    teacher_id bigint not null references users(id) on delete cascade,
    school_year_id bigint not null references school_years(id) on delete cascade,
    term_id bigint not null references terms(id) on delete cascade,
    grade_id bigint not null references grades(id) on delete cascade,
    subject_id bigint not null references subjects(id) on delete cascade,
    competency_id bigint null references competencies(id) on delete set null,
    planned_date date null,
    actual_date date null,
    status varchar(255) not null default 'On Track',
    notes text null,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists pacing_records_teacher_id_term_id_status_index on pacing_records (teacher_id, term_id, status);

create table if not exists activity_logs (
    id bigserial primary key,
    user_id bigint null references users(id) on delete set null,
    action varchar(255) not null,
    subject_type varchar(255) null,
    subject_id bigint null,
    description text null,
    ip_address inet null,
    user_agent text null,
    created_at timestamp null,
    updated_at timestamp null
);
create index if not exists activity_logs_subject_type_subject_id_index on activity_logs (subject_type, subject_id);
create index if not exists activity_logs_user_id_created_at_index on activity_logs (user_id, created_at);

alter table lesson_templates add column if not exists subject varchar(255) null;
alter table lesson_templates add column if not exists grade_level varchar(255) null;
alter table lesson_templates add column if not exists learning_area varchar(255) null;
alter table lesson_templates add column if not exists file_name varchar(255) null;
alter table lesson_templates add column if not exists file_path varchar(255) null;
alter table lesson_templates add column if not exists preview_path varchar(255) null;
alter table lesson_templates add column if not exists file_mime varchar(120) null;
alter table lesson_templates add column if not exists file_size integer null;
alter table lesson_templates add column if not exists processing_status varchar(30) not null default 'ready';
create index if not exists lesson_templates_subject_grade_level_index on lesson_templates (subject, grade_level);

insert into roles (name, code, description, created_at, updated_at) values
    ('Teacher', 'teacher', null, now(), now()),
    ('Curriculum Coordinator', 'curriculum_coordinator', null, now(), now()),
    ('School Administrator', 'school_administrator', null, now(), now()),
    ('System Administrator', 'system_administrator', null, now(), now())
on conflict (code) do update set
    name = excluded.name,
    updated_at = now();

insert into school_years (name, start_date, end_date, is_active, created_at, updated_at)
select '2026-2027', '2026-06-01', '2027-03-31', true, now(), now()
where not exists (select 1 from school_years where name = '2026-2027');

insert into terms (school_year_id, name, start_date, end_date, is_active, created_at, updated_at)
select sy.id, term.name, term.start_date::date, term.end_date::date, term.is_active, now(), now()
from school_years sy
cross join (
    values
        ('First Term', '2026-06-01', '2026-09-30', true),
        ('Second Term', '2026-10-01', '2026-12-31', false),
        ('Third Term', '2027-01-01', '2027-03-31', false)
) as term(name, start_date, end_date, is_active)
where sy.name = '2026-2027'
and not exists (
    select 1 from terms t
    where t.school_year_id = sy.id and t.name = term.name
);

insert into grades (name, created_at, updated_at)
select grade.name, now(), now()
from (values ('Grade 7'), ('Grade 8'), ('Grade 9'), ('Grade 10')) as grade(name)
where not exists (select 1 from grades existing where existing.name = grade.name);

insert into subjects (name, code, created_at, updated_at)
select subject.name, subject.code, now(), now()
from (
    values
        ('Mathematics', 'MATH'),
        ('Science', 'SCI'),
        ('English', 'ENG'),
        ('Filipino', 'FIL')
) as subject(name, code)
where not exists (
    select 1 from subjects existing
    where existing.name = subject.name or existing.code = subject.code
);

insert into migrations (migration, batch)
select migration, coalesce((select max(batch) from migrations), 0) + 1
from (
    values
        ('0001_01_01_000000_create_users_table'),
        ('0001_01_01_000001_create_cache_table'),
        ('0001_01_01_000002_create_jobs_table'),
        ('2026_09_21_041236_create_personal_access_tokens_table'),
        ('2026_09_21_060202_create_roles_table'),
        ('2026_09_21_060203_create_role_user_table'),
        ('2026_09_21_033303_create_school_years_table'),
        ('2026_09_21_033304_create_terms_table'),
        ('2026_09_21_033305_create_grades_table'),
        ('2026_09_21_033306_create_subjects_table'),
        ('2026_09_21_033307_create_curriculum_versions_table'),
        ('2026_09_21_033308_create_competencies_table'),
        ('2026_09_21_033309_create_teacher_assignments_table'),
        ('2026_09_21_033310_create_teacher_schedules_table'),
        ('2026_09_21_033311_create_calendar_events_table'),
        ('2026_09_21_033312_create_lessons_table'),
        ('2026_09_21_033313_create_lesson_objectives_table'),
        ('2026_09_21_033314_create_lesson_activities_table'),
        ('2026_09_21_033315_create_lesson_resources_table'),
        ('2026_09_21_033316_create_lesson_reflections_table'),
        ('2026_09_21_033317_create_competency_mappings_table'),
        ('2026_09_21_033318_create_assessments_table'),
        ('2026_09_21_033319_create_assessment_competencies_table'),
        ('2026_09_21_033320_create_resources_table'),
        ('2026_09_21_033321_create_notifications_table'),
        ('2026_09_21_033322_create_pacing_records_table'),
        ('2026_09_21_033323_create_activity_logs_table'),
        ('2026_09_21_070933_repair_role_schema'),
        ('2026_09_21_100000_add_name_components_to_users_table'),
        ('2026_09_21_100001_add_differentiation_to_lessons_table'),
        ('2026_09_21_104248_synchronize_school_years_schema'),
        ('2026_09_21_110000_add_is_active_to_users_table'),
        ('2026_09_22_002907_synchronize_calendar_events_schema'),
        ('2026_09_22_020100_synchronize_terms_schema'),
        ('2026_09_22_021829_synchronize_resources_assessments_curriculum_versions_schema'),
        ('2026_09_22_120000_add_structured_plan_to_lessons_table'),
        ('2026_09_22_120100_create_lesson_versions_table'),
        ('2026_09_22_130000_create_feedback_reports_table'),
        ('2026_09_22_131000_create_lesson_templates_table'),
        ('2026_09_22_132000_create_system_announcements_table'),
        ('2026_09_22_132000_extend_lesson_templates_for_documents'),
        ('2026_09_23_060309_add_type_to_resources_table')
) as m(migration)
where not exists (
    select 1 from migrations existing where existing.migration = m.migration
);

commit;
