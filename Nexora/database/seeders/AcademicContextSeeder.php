<?php

namespace Database\Seeders;

use App\Models\Grade;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;
use Illuminate\Database\Seeder;

class AcademicContextSeeder extends Seeder
{
    public function run(): void
    {
        // Create School Year
        $schoolYear = SchoolYear::updateOrCreate(
            [
                'name' => '2026-2027',
            ],
            [
                'start_date' => '2026-06-01',
                'end_date' => '2027-03-31',
                'is_active' => true,
            ]
        );

        // Create Terms
        Term::updateOrCreate(
            [
                'school_year_id' => $schoolYear->id,
                'name' => 'First Term',
            ],
            [
                'start_date' => '2026-06-01',
                'end_date' => '2026-09-30',
                'is_active' => true,
            ]
        );

        Term::updateOrCreate(
            [
                'school_year_id' => $schoolYear->id,
                'name' => 'Second Term',
            ],
            [
                'start_date' => '2026-10-01',
                'end_date' => '2026-12-31',
                'is_active' => false,
            ]
        );

        Term::updateOrCreate(
            [
                'school_year_id' => $schoolYear->id,
                'name' => 'Third Term',
            ],
            [
                'start_date' => '2027-01-01',
                'end_date' => '2027-03-31',
                'is_active' => false,
            ]
        );

        // Create Grades
        $grades = [
            [
                'name' => 'Grade 7',
            ],
            [
                'name' => 'Grade 8',
            ],
            [
                'name' => 'Grade 9',
            ],
            [
                'name' => 'Grade 10',
            ],
        ];

        foreach ($grades as $grade) {
            Grade::updateOrCreate(
                ['name' => $grade['name']],
                $grade
            );
        }

        // Create Subjects
        $subjects = [
            [
                'name' => 'Mathematics',
                'code' => 'MATH',
            ],
            [
                'name' => 'Science',
                'code' => 'SCI',
            ],
            [
                'name' => 'English',
                'code' => 'ENG',
            ],
            [
                'name' => 'Filipino',
                'code' => 'FIL',
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }
}
