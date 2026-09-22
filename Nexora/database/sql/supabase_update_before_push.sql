-- NEXORA Supabase SQL update before push/sync
-- Run this in Supabase SQL Editor for the production database.
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

-- Optional initial production teacher account.
-- Email: testteacher@nexora.test
-- Password: password123
insert into users (name, email, password, is_active, created_at, updated_at)
values ('Test Teacher', 'testteacher@nexora.test', '$2y$12$0OrfNa4DIf5QR05KaXuUf.lk.vT6.Vbqfv5DE0AQCVwwIiPdwUIVS', true, now(), now())
on conflict (email) do nothing;

insert into role_user (role_id, user_id, created_at, updated_at)
select r.id, u.id, now(), now()
from roles r
join users u on u.email = 'testteacher@nexora.test'
where r.code = 'teacher'
on conflict (role_id, user_id) do nothing;

insert into migrations (migration, batch)
select migration, coalesce((select max(batch) from migrations), 0) + 1
from (
    values
        ('0001_01_01_000000_create_users_table'),
        ('2026_09_21_041236_create_personal_access_tokens_table'),
        ('2026_09_21_060202_create_roles_table'),
        ('2026_09_21_060203_create_role_user_table'),
        ('2026_09_21_033303_create_school_years_table'),
        ('2026_09_21_033304_create_terms_table'),
        ('2026_09_21_033305_create_grades_table'),
        ('2026_09_21_033306_create_subjects_table'),
        ('2026_09_21_033307_create_curriculum_versions_table'),
        ('2026_09_21_033308_create_competencies_table'),
        ('2026_09_21_033312_create_lessons_table'),
        ('2026_09_21_033313_create_lesson_objectives_table'),
        ('2026_09_21_033314_create_lesson_activities_table'),
        ('2026_09_21_033315_create_lesson_resources_table'),
        ('2026_09_21_033316_create_lesson_reflections_table'),
        ('2026_09_21_033317_create_competency_mappings_table'),
        ('2026_09_21_100000_add_name_components_to_users_table'),
        ('2026_09_21_100001_add_differentiation_to_lessons_table'),
        ('2026_09_21_110000_add_is_active_to_users_table'),
        ('2026_09_22_120000_add_structured_plan_to_lessons_table'),
        ('2026_09_22_120100_create_lesson_versions_table')
) as m(migration)
where not exists (
    select 1 from migrations existing where existing.migration = m.migration
);

commit;
