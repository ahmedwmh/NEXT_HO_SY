import { PatientForm } from '@/components/admin/patient-form'

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
        <p className="text-gray-600 mt-2">
          Register a new patient in the system
        </p>
      </div>

      <PatientForm />
    </div>
  )
}
