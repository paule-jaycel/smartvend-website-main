import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import carMeetImage from "@/assets/car-meet.png";
import carMeetQrImage from "@/assets/qr-car-meet.jpg";

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  birthday: string;
  gender: string;
  email: string;
  phoneNumber: string;
  barangay: string;
  civilStatus: string;
}

const initialFormData: RegistrationFormData = {
  firstName: "",
  lastName: "",
  birthday: "",
  gender: "",
  email: "",
  phoneNumber: "",
  barangay: "",
  civilStatus: "",
};

const fieldClassName =
  "w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-2 text-black outline-none transition-colors placeholder:text-gray-400 focus:border-purple-500 focus:bg-white";

const calculateAge = (birthday: string): number => {
  if (!birthday) return 0;

  const birthDate = new Date(`${birthday}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

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
      const jsonBody = {
        ...formData,
        age: calculateAge(formData.birthday),
        eventName: "VINFAST X CleanIt",
        registrationStatus: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await fetch(
        "https://cleanitapiwebservice-v52dc.ondigitalocean.app/car_meet/addRegistration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonBody),
        },
      );

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
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
        error instanceof TypeError && error.message.toLowerCase().includes("fetch")
          ? "Unable to connect to the registration service. Your registration was not confirmed. Please try again later."
          : error instanceof Error
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
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8">
          <div className="relative mb-6 overflow-hidden rounded-2xl px-2 py-5">
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <h2 className="relative -mt-2 text-2xl font-bold text-gray-900">
              Registration Successful!
            </h2>
          </div>
          <p className="mb-6 text-gray-600">
            Thank you for registering for VINFAST X CleanIt. We look forward to seeing you at the
            event!
          </p>
          <div className="mb-6 overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
                Registration confirmed
              </p>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="px-5 py-5">
              <p className="mb-2 text-center text-xl font-bold text-gray-900">VINFAST X CleanIt</p>
              <p className="mb-5 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Name:</span> {formData.firstName}{" "}
                {formData.lastName}
              </p>
              <div className="rounded-xl border-2 border-dashed border-purple-300 bg-white p-4 text-center shadow-sm">
                <p className="mb-3 text-sm font-semibold text-gray-800">
                  Scan to get the CleanIt app
                </p>
                <img
                  src={carMeetQrImage}
                  alt="QR code to download the CleanIt mobile app"
                  className="mx-auto h-auto w-full max-w-[220px] rounded-lg"
                />
                <p className="mt-3 text-xs text-gray-500">
                  We can&apos;t wait to see you at the event!
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              setSubmitError("");
              setIsSubmitted(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full rounded-lg bg-linear-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            Register Another Person
          </button>
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
          <div className="h-40 overflow-hidden sm:h-48 md:h-56 lg:h-64">
            <img
              src={carMeetImage}
              alt="VINFAST X CleanIt Car Meet"
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {submitError && (
                <Alert className="border-[#B42318] bg-[#FEF3F2] text-[#B42318]" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <section className="mb-4 rounded-xl bg-linear-to-r from-purple-50 to-blue-50 p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-purple-800">EVENT INFORMATION</h2>
                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      <CalendarDays className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="mb-1 text-xs font-bold text-black">Date &amp; Time</p>
                      <p className="text-sm leading-5 text-gray-900">
                        October 18, 2026 <br /> 9:00 A.M.
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="mb-1 text-xs font-bold text-black">Location</p>
                      <p className="text-sm leading-5 text-gray-900">
                        <span className="font-semibold bg-green-100 text-green-800 px-1 rounded">
                          Start Point :
                        </span>{" "}
                        central park, central ave (beside 7/11)
                        <br />
                        <span className="font-semibold bg-red-100 text-red-800 px-1 rounded">
                          End point :
                        </span>{" "}
                        Philippine Arena
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-blue-50 p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-700">
                      Special appearance
                    </p>
                    <h2 className="text-lg font-bold text-gray-900">Meet our guests</h2>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: "Tyang Amy Perez", role: "CleanIt Brand Ambassador" },
                    { name: "Carlo Castillo", role: "Special Guest" },
                  ].map(guest => (
                    <div
                      key={guest.name}
                      className="flex items-center gap-3 rounded-xl border border-purple-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-bold text-white">
                        {guest.name
                          .split(" ")
                          .map(name => name[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{guest.name}</p>
                        <p className="text-xs font-medium text-purple-700">{guest.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-6 overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-300 via-orange-200 to-pink-200 p-[1px] shadow-lg shadow-orange-200/50 sm:p-[1.5px]">
                <div className="flex items-start gap-3 rounded-[15px] bg-gradient-to-r from-[#fffaf0] via-[#fff1d6] to-[#fdf2f8] p-4 sm:p-5">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-xl shadow-md shadow-pink-300/70"
                    aria-hidden="true"
                  >
                    🎁
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-700">
                      Giveaway
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-800 sm:text-base">
                      All participants must register to be eligible for CleanIt vouchers and
                      exclusive gifts.
                    </p>
                  </div>
                </div>
              </section>

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
                  <label htmlFor="age" className="mb-2 block text-sm font-semibold text-gray-900">
                    Age
                  </label>
                  <input
                    id="age"
                    value={formData.birthday ? `${calculateAge(formData.birthday)} years old` : ""}
                    placeholder="--"
                    className={`${fieldClassName} bg-gray-100 font-semibold`}
                    readOnly
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={fieldClassName}
                    required
                  >
                    <option value="" disabled>
                      Select your gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
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
