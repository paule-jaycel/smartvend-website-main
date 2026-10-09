import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
  phoneNumber: string;
  barangay: string;
  civilStatus: string;
}

const initialFormData: RegistrationFormData = {
  firstName: "",
  lastName: "",
  birthday: "",
  email: "",
  phoneNumber: "",
  barangay: "",
  civilStatus: "",
};

const fieldClassName =
  "w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-2 text-black outline-none transition-colors placeholder:text-gray-400 focus:border-purple-500 focus:bg-white";

export function CarMeetRegistration() {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.currentTarget;
    setFormData(previous => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://cleanitapiwebservice-v52dc.ondigitalocean.app/carmeet/addRegistration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...formData,
            eventName: "VINFAST X CleanIt",
            registrationStatus: "PENDING",
            createdAt: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText.trim().startsWith("<")
            ? `Registration request failed (HTTP ${response.status}).`
            : responseText.trim().slice(0, 240) ||
                `Registration request failed (HTTP ${response.status}).`,
        );
      }

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We were unable to complete your registration. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-900 via-blue-900 to-purple-800 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Registration Successful!</h2>
          <p className="text-gray-600">
            Thank you for registering for VINFAST X CleanIt. We look forward to seeing you at the
            event!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-linear-to-br from-purple-900 via-blue-900 to-purple-800 py-8 md:py-10 lg:py-12">
      <div className="mx-auto max-w-2xl px-3 sm:px-4 md:px-6">
        <header className="mb-8 text-center md:mb-10">
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl md:mb-3 md:text-5xl">
            VINFAST X CleanIt
          </h1>
          <p className="mb-3 text-lg font-bold text-purple-400 sm:text-xl md:mb-4 md:text-2xl">
            Registration Form
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div aria-hidden="true" className="h-40 sm:h-48 md:h-56 lg:h-64" />

          <div className="p-6 sm:p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {submitError && (
                <Alert className="border-[#B42318] bg-[#FEF3F2] text-[#B42318]" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div aria-hidden="true" className="min-h-16" />

              <section className="space-y-3 border-t pt-6 md:space-y-4 md:pt-8">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Personal Information</h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className={fieldClassName}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Last Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className={fieldClassName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="birthday"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Birthday <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className={fieldClassName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-900">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className={fieldClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    pattern="09[0-9]{9}"
                    maxLength={11}
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="09XXXXXXXXX"
                    className={fieldClassName}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Format: 09XXXXXXXXX (11 digits)</p>
                </div>

                <div>
                  <label
                    htmlFor="barangay"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Barangay <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="barangay"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    placeholder="Enter your barangay"
                    className={fieldClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="civilStatus"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Civil Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="civilStatus"
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleInputChange}
                    className={fieldClassName}
                    required
                  >
                    <option value="" disabled>
                      Select a civil status
                    </option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="divorced">Divorced</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>
              </section>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? "Submitting..." : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
