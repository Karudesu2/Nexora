<?php

namespace App\Services;

use App\Models\Competency;
use App\Models\CurriculumVersion;
use App\Models\Grade;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;

class AcademicContextService
{
    public function createSchoolYear(array $data): SchoolYear
    {
        if ($data['is_active'] ?? false) {
            SchoolYear::query()->where('is_active', true)->update(['is_active' => false]);
        }

        return SchoolYear::create($data);
    }

    public function createTerm(array $data): Term
    {
        if ($data['is_active'] ?? false) {
            Term::query()
                ->where('school_year_id', $data['school_year_id'])
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        return Term::create($data);
    }

    public function createGrade(array $data): Grade
    {
        return Grade::firstOrCreate(['name' => $data['name']]);
    }

    public function createSubject(array $data): Subject
    {
        return Subject::firstOrCreate(
            ['name' => $data['name']],
            ['code' => $data['code'] ?? null]
        );
    }

    public function createCurriculumVersion(array $data): CurriculumVersion
    {
        if ($data['is_active'] ?? false) {
            CurriculumVersion::query()
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        return CurriculumVersion::create($data);
    }

    public function createCompetency(array $data): Competency
    {
        return Competency::create($data);
    }
}
