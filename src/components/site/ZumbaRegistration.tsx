import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle2, Upload, Loader2, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Tesseract from "tesseract.js";
import modgcashQR from "@/assets/modgcash.jpg";
import playStoreBadge from "@/assets/Playstore.png";
import appStoreBadge from "@/assets/appstore.png";
import {
  IS_ZUMBA_REGISTRATION_CLOSED,
  ZUMBA_REGISTRATION_CLOSED_MESSAGE,
} from "./zumbaRegistrationAvailability";

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
  phoneNumber: string;
  barangay: string;
  instructorName: string;
  civilStatus: "single" | "married" | "widowed" | "divorced" | "separated" | null;
  registrationPackage: "regular" | "vip" | null;
  modeOfPayment: "cash" | "gcash" | "bank-transfer" | null;
  gcashProof: File | null;
  bankProof: File | null;
  paymentReference: string;
  paymentDate: string | null;
}

interface FormErrors {
  [key: string]: string;
}

export function ZumbaRegistration() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: "",
    lastName: "",
    birthday: "",
    email: "",
    phoneNumber: "",
    barangay: "",
    instructorName: "",
    civilStatus: null,
    registrationPackage: null,
    modeOfPayment: null,
    gcashProof: null,
    bankProof: null,
    paymentReference: "",
    paymentDate: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentProofDate, setPaymentProofDate] = useState<string | null>(null);
  const [paymentProofAmountCents, setPaymentProofAmountCents] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isCivilStatusOpen, setIsCivilStatusOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitErrorRef = useRef<HTMLDivElement>(null);
  const gcashFileInputRef = useRef<HTMLInputElement>(null);
  const bankFileInputRef = useRef<HTMLInputElement>(null);
  const civilStatusRef = useRef<HTMLDivElement>(null);
  const [registrationReference, setRegistrationReference] = useState<string | null>(null);

  useEffect(() => {
    if (!submitError) return;

    window.requestAnimationFrame(() => {
      submitErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      submitErrorRef.current?.focus({ preventScroll: true });
    });
  }, [submitError]);

  const focusFirstError = (formErrors: FormErrors) => {
    const visualFieldOrder = [
      "registrationPackage",
      "firstName",
      "lastName",
      "birthday",
      "email",
      "phoneNumber",
      "barangay",
      "civilStatus",
      "modeOfPayment",
      "gcashProof",
      "bankProof",
    ];
    const firstErrorName = visualFieldOrder.find(fieldName => formErrors[fieldName]);
    const firstErrorField = firstErrorName
      ? formRef.current?.querySelector<HTMLElement>(`[name="${firstErrorName}"]`)
      : null;

    if (firstErrorField) {
      window.setTimeout(() => {
        const errorMessage = formRef.current?.querySelector<HTMLElement>(
          `#${firstErrorName}-error`,
        );
        (errorMessage ?? firstErrorField).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstErrorField.focus({ preventScroll: true });
      }, 0);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (civilStatusRef.current && !civilStatusRef.current.contains(event.target as Node)) {
        setIsCivilStatusOpen(false);
      }
    };

    if (isCivilStatusOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isCivilStatusOpen]);

  const packagePrices = {
    regular: 109,
    vip: 190,
  };
  const paymentProofDateRange = {
    start: "2026-05-29",
    end: "2026-10-11",
  };
  const formatPaymentProofDate = (date: string | null) =>
    date
      ? new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not detected";
  const formatPaymentProofAmount = (amountCents: number | null) =>
    amountCents === null
      ? "Not detected"
      : `₱${(amountCents / 100).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const contestCategories = [
    {
      title: "Best Dressed",
      criteria: 'Most "bongga" and stylish Zumba-Fit outfit.',
    },
    {
      title: "Best Dancer",
      criteria: 'Dancer who has that flashy "pitik" and consistently timed Zumba moves.',
    },
    {
      title: "Best Zumba Instructor",
      criteria: "Instructor who has the best choreographed/coordinated team.",
    },
    {
      title: "Most Energetic Participant",
      criteria: "Never ran out of Zumba energy all throughout the event.",
    },
    {
      title: "Best Group / Team Spirit",
      criteria: "Most flawless coordination and Zumba-Fit moves.",
    },
    {
      title: "Social Media Star",
      criteria: (
        <>
          Most creative shot uploaded to Facebook using the hashtag
          <br />
          #Zumba-FitbyCleanIt.
        </>
      ),
    },
  ];

  const centeredContestCategory = {
    title: "CleanIt App Star",
    criteria: "Most active CleanIt app account/registration.",
  };

  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getBirthdayError = (birthday: string): string | null => {
    if (!birthday) {
      return "This field is required.";
    }

    const birthDate = new Date(`${birthday}T00:00:00`);
    const [year, month, day] = birthday.split("-").map(Number);
    const birthYear = year;
    const isValidCalendarDate =
      birthDate.getFullYear() === year &&
      birthDate.getMonth() === month - 1 &&
      birthDate.getDate() === day;

    if (Number.isNaN(birthDate.getTime()) || !isValidCalendarDate) {
      return "Please enter a valid date of birth.";
    }

    if (birthYear <= 1925) {
      return "Birth year 1925 and below is not accepted.";
    }

    const today = new Date();
    const minimumAgeDate = new Date(today);
    minimumAgeDate.setFullYear(today.getFullYear() - 16);

    if (birthDate > minimumAgeDate) {
      return "You must be at least 16 years old to register.";
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      // Only allow numbers
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 11) {
        setFormData(prev => ({ ...prev, phoneNumber: numbersOnly }));
      }
    } else if (name === "birthday") {
      setFormData(prev => ({ ...prev, birthday: value }));
      setErrors(prev => {
        const birthdayError = getBirthdayError(value);
        const newErrors = { ...prev };

        if (!birthdayError) {
          delete newErrors.birthday;
        } else {
          newErrors.birthday = birthdayError;
        }

        return newErrors;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (name !== "birthday" && errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePackageSelect = (pkg: "regular" | "vip") => {
    setFormData(prev => ({ ...prev, registrationPackage: pkg }));
    if (errors.registrationPackage) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.registrationPackage;
        return newErrors;
      });
    }
  };

  const handleCivilStatusSelect = (
    status: "single" | "married" | "widowed" | "divorced" | "separated",
  ) => {
    setFormData(prev => ({ ...prev, civilStatus: status }));
    if (errors.civilStatus) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.civilStatus;
        return newErrors;
      });
    }
  };

  const extractPaymentProofDetails = (text: string) => {
    const lines = text.replace(/\r\n?/g, "\n").split("\n").map(line => line.trim());
    const referenceLineIndex = lines.findIndex(line =>
      /\b(?:ref(?:erence)?|transaction|txn|trans(?:action)?)\b/i.test(line),
    );
    const orderedLines = lines
      .map((line, index) => ({
        line,
        distance: referenceLineIndex < 0 ? index : Math.abs(index - referenceLineIndex),
      }))
      .filter(({ line }) => line)
      .sort((first, second) => first.distance - second.distance);

    const monthNumbers: Record<string, number> = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      sept: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    };
    const validIsoDate = (year: number, month: number, day: number) => {
      const date = new Date(Date.UTC(year, month - 1, day));
      if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
      ) {
        return null;
      }
      return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
    };

    const parseDateFromLine = (line: string) => {
      const monthNameMatch = line.match(
        /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(\d{2,4})\b/i,
      );
      if (monthNameMatch) {
        const month =
          monthNumbers[monthNameMatch[1].slice(0, 4).toLowerCase()] ??
          monthNumbers[monthNameMatch[1].slice(0, 3).toLowerCase()];
        let year = Number(monthNameMatch[3]);
        if (year < 100) year += 2000;
        return month ? validIsoDate(year, month, Number(monthNameMatch[2])) : null;
      }

      const dayMonthNameMatch = line.match(
        /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\.?[,]?\s+(\d{2,4})\b/i,
      );
      if (dayMonthNameMatch) {
        const month =
          monthNumbers[dayMonthNameMatch[2].slice(0, 4).toLowerCase()] ??
          monthNumbers[dayMonthNameMatch[2].slice(0, 3).toLowerCase()];
        let year = Number(dayMonthNameMatch[3]);
        if (year < 100) year += 2000;
        return month ? validIsoDate(year, month, Number(dayMonthNameMatch[1])) : null;
      }

      const isoMatch = line.match(/\b((?:19|20)\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
      if (isoMatch) {
        return validIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
      }

      const numericMatch = line.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
      if (!numericMatch) return null;

      let year = Number(numericMatch[3]);
      if (year < 100) year += 2000;
      const first = Number(numericMatch[1]);
      const second = Number(numericMatch[2]);
      const candidates =
        first > 12
          ? [[year, second, first]]
          : second > 12
            ? [[year, first, second]]
            : [[year, first, second], [year, second, first]];
      const parsedCandidates = candidates
        .map(([candidateYear, month, day]) => validIsoDate(candidateYear, month, day))
        .filter((date): date is string => date !== null);

      return (
        parsedCandidates.find(
          date => date >= paymentProofDateRange.start && date <= paymentProofDateRange.end,
        ) ??
        parsedCandidates[0] ??
        null
      );
    };

    let date: string | null = null;
    for (const { line } of orderedLines) {
      date = parseDateFromLine(line);
      if (date) break;
    }

    const amountPattern =
      /\b(?:total\s+amount\s+sent|amount(?:\s+(?:sent|paid|transferred))?|total\s+paid)\b[^\d]{0,24}(?:₱|PHP\s*)?\s*([\d,]+(?:\.\d{1,2})?)/i;
    const labeledAmount = text.match(amountPattern);
    const currencyAmount = text.match(/(?:₱|\bPHP\s*)\s*([\d,]+(?:\.\d{1,2})?)/i);
    const rawAmount = labeledAmount?.[1] ?? currencyAmount?.[1] ?? null;
    const amountCents = rawAmount
      ? Math.round(Number(rawAmount.replace(/,/g, "")) * 100)
      : null;

    return { date, amountCents: Number.isFinite(amountCents) ? amountCents : null };
  };

  const extractReferenceFromText = (
    text: string,
    method: "gcash" | "bank-transfer",
    blocks: Tesseract.Block[] | null = null,
  ) => {
    const lines = text.replace(/\r\n?/g, "\n").split("\n").map(line => line.trim());
    for (let index = 0; index < lines.length - 1; index++) {
      if (
        /\b(?:ref(?:erence)?|transaction|txn|trans(?:action)?)\s*$/i.test(lines[index]) &&
        /^(?:no|num|number|id)\b[.:#-]?/i.test(lines[index + 1])
      ) {
        lines[index] = `${lines[index]} ${lines[index + 1]}`;
        lines.splice(index + 1, 1);
      }
    }
    const referenceLabelPattern =
      /\b(?:ref(?:erence)?(?:\s*(?:no|num|number))?)\b\s*[:#.|-]*/i;
    const transactionLabelPattern =
      /\b(?:transaction(?:\s*(?:id|no|num|number))?|txn(?:\s*(?:id|no|num|number))?|trans(?:action)?(?:\s*(?:id|no|num|number))?)\b\s*[:#.|-]*/i;
    const getLabelMatch = (value: string) => {
      const referenceMatch = referenceLabelPattern.exec(value);
      if (referenceMatch) return { match: referenceMatch, priority: 2 };
      if (method === "gcash") return null;

      const transactionMatch = transactionLabelPattern.exec(value);
      return transactionMatch ? { match: transactionMatch, priority: 1 } : null;
    };
    const excludedLabels =
      /\b(?:date|time|amount|total|thank|thanks|account|name|balance|status|phone|mobile|contact|sender|recipient|paid)\b/i;
    const excludedValues = new Set([
      "gcash", "bank", "transfer", "reference", "transaction", "txn", "ref", "receipt",
    ]);
    const isMetadataWord = (word: string) =>
      /^(?:date|time|amount|total|thank|thanks|account|name|balance|status|phone|mobile|contact|sender|recipient|paid|php|peso|reference|ref|transaction|txn|receipt|gcash|bank|transfer|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|[ap]m|\$|₱|\d{1,2}:\d{2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|(?:19|20)\d{2}[/-]\d{1,2}[/-]\d{1,2})\b/i.test(
        word.replace(/^[^A-Z0-9₱$]+/i, ""),
      );
    let bestReference: string | null = null;
    let bestReferencePriority = 0;
    const considerReference = (reference: string, priority: number) => {
      const candidateLength = reference.replace(/[^A-Z0-9]/gi, "").length;
      const currentLength = bestReference?.replace(/[^A-Z0-9]/gi, "").length ?? 0;
      if (priority > bestReferencePriority || (priority === bestReferencePriority && candidateLength > currentLength)) {
        bestReference = reference;
        bestReferencePriority = priority;
      }
    };

    if (blocks?.length) {
      const ocrLines = blocks.flatMap(block =>
        block.paragraphs.flatMap(paragraph => paragraph.lines.map(line => ({ line }))),
      ).sort((first, second) => first.line.bbox.y0 - second.line.bbox.y0 || first.line.bbox.x0 - second.line.bbox.x0);

      for (let lineIndex = 0; lineIndex < ocrLines.length; lineIndex++) {
        const { line } = ocrLines[lineIndex];
        const label = getLabelMatch(line.text);
        if (!label) continue;
        const { match: labelMatch, priority } = label;

        let characterOffset = 0;
        let labelWordIndex = -1;
        for (let wordIndex = 0; wordIndex < line.words.length; wordIndex++) {
          const word = line.words[wordIndex];
          const wordEnd = characterOffset + word.text.length;
          if (wordEnd >= labelMatch.index + labelMatch[0].length) {
            labelWordIndex = wordIndex;
            break;
          }
          characterOffset = wordEnd + 1;
        }
        if (labelWordIndex < 0) continue;

        const referenceWords: string[] = [];
        let referenceStartX = line.words[labelWordIndex].bbox.x1;
        let metadataStartX: number | null = null;
        for (let wordIndex = labelWordIndex + 1; wordIndex < line.words.length; wordIndex++) {
          const word = line.words[wordIndex];
          if (isMetadataWord(word.text)) {
            metadataStartX = word.bbox.x0;
            break;
          }
          if (!referenceWords.length) referenceStartX = word.bbox.x0;
          referenceWords.push(word.text);
        }

        const isReference = (words: string[]) => {
          const firstWord = words[0]?.toLowerCase() ?? "";
          return words.length > 0 && /[A-Z0-9]/i.test(words.join("")) && !excludedValues.has(firstWord);
        };

        let previousY = line.bbox.y1;
        const lineHeight = Math.max(1, line.bbox.y1 - line.bbox.y0);
        for (let nextIndex = lineIndex + 1; nextIndex < ocrLines.length; nextIndex++) {
          const nextLine = ocrLines[nextIndex].line;
          const verticalGap = nextLine.bbox.y0 - previousY;
          const firstWord = nextLine.words[0];
          if (!firstWord) continue;

          const alignmentTolerance = Math.max(20, lineHeight * 1.5);
          const sameVisualRow = nextLine.bbox.y0 < previousY - lineHeight * 0.4;

          if (sameVisualRow) {
            if (isMetadataWord(firstWord.text)) {
              metadataStartX = Math.min(metadataStartX ?? firstWord.bbox.x0, firstWord.bbox.x0);
              continue;
            }

            if (
              firstWord.bbox.x0 < referenceStartX - alignmentTolerance ||
              (metadataStartX !== null && firstWord.bbox.x0 >= metadataStartX - alignmentTolerance)
            ) {
              continue;
            }
          } else {
            if (verticalGap > Math.max(24, lineHeight * 1.75)) break;
            if (isMetadataWord(firstWord.text)) break;
            if (Math.abs(firstWord.bbox.x0 - referenceStartX) > alignmentTolerance) break;
          }

          const previousWordCount = referenceWords.length;
          for (const word of nextLine.words) {
            if (isMetadataWord(word.text)) {
              metadataStartX = word.bbox.x0;
              break;
            }
            referenceWords.push(word.text);
          }

          if (referenceWords.length === previousWordCount) continue;
          if (!sameVisualRow) previousY = nextLine.bbox.y1;
        }

        if (isReference(referenceWords)) considerReference(referenceWords.join(" "), priority);
      }
    }

    const findReferenceValue = (value: string) => {
      const metadataBoundary = /\s+(?=(?:date|time|amount|total|account|name|balance|status|phone|mobile|contact|sender|recipient|paid|php|peso|reference|ref|transaction|txn|receipt|gcash|bank|transfer|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|[ap]m)\b|[₱$]|\d{1,2}:\d{2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i;
      const boundaryIndex = value.search(metadataBoundary);
      const referenceValue = (boundaryIndex < 0 ? value : value.slice(0, boundaryIndex)).trim();
      const firstToken = referenceValue.split(/\s+/)[0]?.toLowerCase() ?? "";

      if (!referenceValue || !/[A-Z0-9]/i.test(referenceValue) || excludedValues.has(firstToken)) {
        return null;
      }

      return referenceValue;
    };

    const appendReferenceContinuation = (reference: string, startIndex: number) => {
      let completeReference = reference;
      for (let index = startIndex; index < lines.length; index++) {
        const line = lines[index];
        if (!line) continue;
        if (getLabelMatch(line) || excludedLabels.test(line)) break;

        const continuation = findReferenceValue(line);
        if (!continuation || !/^\d[\d\s-]*$/.test(continuation)) break;
        completeReference = `${completeReference} ${continuation}`;
      }

      return completeReference;
    };

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const label = getLabelMatch(line);
      if (!label) continue;
      const { match: labelMatch, priority } = label;

      const sameLineValue = findReferenceValue(line.slice(labelMatch.index + labelMatch[0].length));
      if (sameLineValue) {
        considerReference(appendReferenceContinuation(sameLineValue, index + 1), priority);
      }

      const nextLine = lines[index + 1] ?? "";
      if (nextLine && !getLabelMatch(nextLine) && !excludedLabels.test(nextLine)) {
        const nextLineValue = findReferenceValue(nextLine);
        if (nextLineValue) {
          considerReference(appendReferenceContinuation(nextLineValue, index + 2), priority);
        }
      }
    }

    return bestReference;
  };

  const validatePaymentProofText = (
    text: string,
    method: "gcash" | "bank-transfer",
    blocks: Tesseract.Block[] | null = null,
  ) => {
    const extracted = extractReferenceFromText(text, method, blocks);
    if (!extracted) {
      return {
        isValid: false,
        message:
          method === "gcash"
            ? "We could not read a valid GCash Reference Number from the uploaded screenshot."
            : "We could not read a valid Transaction ID/Number from the uploaded screenshot.",
      };
    }

    return { isValid: true, extractedValue: extracted };
  };

  const handlePaymentMethodSelect = (method: "cash" | "gcash" | "bank-transfer") => {
    setFormData(prev => ({
      ...prev,
      modeOfPayment: method,
      gcashProof: null,
      bankProof: null,
      paymentReference: "",
      paymentDate: null,
    }));
    setPaymentProofDate(null);
    setPaymentProofAmountCents(null);
    if (errors.modeOfPayment) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.modeOfPayment;
        return newErrors;
      });
    }
    if (gcashFileInputRef.current) gcashFileInputRef.current.value = "";
    if (bankFileInputRef.current) bankFileInputRef.current.value = "";
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    paymentType: "gcash" | "bank",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitError(currentError =>
      currentError === "This payment reference has already been used." ? "" : currentError,
    );

    const method = paymentType === "gcash" ? "gcash" : "bank-transfer";
    const fieldName = paymentType === "gcash" ? "gcashProof" : "bankProof";

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: "Please upload a valid image file, such as JPG or PNG.",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: "Please upload a payment screenshot smaller than 10MB.",
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      paymentReference: "",
      paymentDate: null,
      gcashProof: paymentType === "gcash" ? file : null,
      bankProof: paymentType === "bank" ? file : null,
    }));
    setPaymentProofDate(null);
    setPaymentProofAmountCents(null);

    try {
      setErrors(prev => {
        const nextErrors = { ...prev };
        delete nextErrors[fieldName];
        return nextErrors;
      });

      const firstPass = await Tesseract.recognize(file, "eng");
      let parsedText = firstPass.data?.text ?? "";
      let validation = validatePaymentProofText(parsedText, method, firstPass.data.blocks);

      if (!validation.isValid || !validation.extractedValue) {
        try {
          const bitmap = await createImageBitmap(file);
          try {
            const scale = Math.min(2, 4000 / Math.max(bitmap.width, bitmap.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));
            const context = canvas.getContext("2d");

            if (context) {
              context.filter = "grayscale(1) contrast(1.5)";
              context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

              const retryPass = await Tesseract.recognize(canvas, "eng");
              const retryText = retryPass.data?.text ?? "";
              const retryValidation = validatePaymentProofText(
                retryText,
                method,
                retryPass.data.blocks,
              );

              if (retryValidation.isValid && retryValidation.extractedValue) {
                parsedText = retryText;
                validation = retryValidation;
              } else {
                parsedText = `${parsedText}\n${retryText}`;
                validation = validatePaymentProofText(parsedText, method);
              }
            }
          } finally {
            bitmap.close();
          }
        } catch {
          // Keep the original OCR result if the enhanced retry cannot run.
        }
      }

      const proofDetails = extractPaymentProofDetails(parsedText);
      setPaymentProofDate(proofDetails.date);
      setPaymentProofAmountCents(proofDetails.amountCents);
      setFormData(prev => ({ ...prev, paymentDate: proofDetails.date }));

      if (!validation.isValid || !validation.extractedValue) {
        setErrors(prev => ({ ...prev, [fieldName]: validation.message }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        paymentReference: validation.extractedValue,
      }));
    } catch {
      setErrors(prev => ({
        ...prev,
        [fieldName]:
          method === "gcash"
            ? "Unable to validate the GCash screenshot. Please upload a readable payment image."
            : "Unable to validate the bank transfer screenshot. Please upload a readable payment image.",
      }));
      setFormData(prev => ({ ...prev, paymentReference: "", paymentDate: null }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "This field is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "This field is required.";
    }

    const birthdayError = getBirthdayError(formData.birthday);
    if (birthdayError) {
      newErrors.birthday = birthdayError;
    }

    if (!formData.email) {
      newErrors.email = "This field is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "This field is required.";
    } else if (formData.phoneNumber.length !== 11) {
      newErrors.phoneNumber = "Please enter an 11-digit phone number.";
    } else if (!formData.phoneNumber.startsWith("09")) {
      newErrors.phoneNumber = "Please enter a phone number beginning with 09.";
    }

    if (!formData.barangay.trim()) {
      newErrors.barangay = "This field is required.";
    }

    if (!formData.civilStatus) {
      newErrors.civilStatus = "Please select your civil status.";
    }

    if (!formData.registrationPackage) {
      newErrors.registrationPackage = "Please select a registration package.";
    }

    if (!formData.modeOfPayment) {
      newErrors.modeOfPayment = "Please select a payment method.";
    }

    if (formData.modeOfPayment === "gcash" && !formData.gcashProof) {
      newErrors.gcashProof = "Please upload proof of GCash payment.";
    }

    if (formData.modeOfPayment === "bank-transfer" && !formData.bankProof) {
      newErrors.bankProof = "Please upload proof of bank transfer.";
    }

    if (formData.modeOfPayment && (formData.gcashProof || formData.bankProof)) {
      const proofField = formData.modeOfPayment === "gcash" ? "gcashProof" : "bankProof";
      if (
        !paymentProofDate ||
        paymentProofDate < paymentProofDateRange.start ||
        paymentProofDate > paymentProofDateRange.end
      ) {
        newErrors[proofField] = "Payment proof must be dated Sept. 29–Oct. 11, 2026.";
    } else if (
  formData.registrationPackage &&
  (paymentProofAmountCents === null ||
    paymentProofAmountCents < packagePrices[formData.registrationPackage] * 100)
) {
  newErrors[proofField] =
    formData.registrationPackage === "vip"
      ? "Payment proof amount must be at least ₱190 (VIP fee)."
      : "Payment proof amount must be at least ₱109 (Regular fee).";
}
    }

  const referenceMissing =
  typeof formData.paymentReference !== "string" ||
  formData.paymentReference.trim().length === 0;

  if (formData.modeOfPayment && formData.modeOfPayment !== "cash" && referenceMissing) {
  newErrors[
    formData.modeOfPayment === "gcash" ? "gcashProof" : "bankProof"
  ] =
    "We couldn't read a reference number. Please re-upload a clearer proof of payment.";
}

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const normalizePhoneNumber = (value?: string | null) =>
    value?.replace(/\D/g, "").replace(/^63(?=\d{10}$)/, "0") ?? "";

  const checkForDuplicatePhone = async (): Promise<boolean> => {
    const currentPhoneNumber = normalizePhoneNumber(formData.phoneNumber);
    if (!currentPhoneNumber) return false;

    try {
      const cachedRegistrations = JSON.parse(localStorage.getItem("zumbaRegistrations") ?? "[]");
      if (
        Array.isArray(cachedRegistrations) &&
        cachedRegistrations.some((entry: Record<string, unknown>) =>
          normalizePhoneNumber(String(entry.phoneNumber ?? entry.phone_number ?? "")) ===
          currentPhoneNumber,
        )
      ) {
        return true;
      }
    } catch {
      // Ignore local storage read issues and continue with the live check.
    }

    try {
      const response = await fetch(
        //"https://oyster-app-uv94u.ondigitalocean.app/zumba/addRegistration", //for local host
        "https://cleanitapiwebservice-v52dc.ondigitalocean.app/zumba/getRegistrations",
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );
      if (!response.ok) return false;

      const payload = await response.json().catch(() => null);
      const registrations = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      return registrations.some((entry: Record<string, unknown>) =>
        normalizePhoneNumber(String(entry.phoneNumber ?? entry.phone_number ?? "")) ===
        currentPhoneNumber,
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    const paymentAmountCents =
      formData.modeOfPayment === "cash"
        ? (formData.registrationPackage ? packagePrices[formData.registrationPackage] * 100 : null)
        : paymentProofAmountCents;
    if (paymentAmountCents === null) {
      setSubmitError("Payment amount could not be read from the proof of payment.");
      return;
    }

    setIsLoading(true);

    try {
      if (await checkForDuplicatePhone()) {
        setSubmitError("Phone number already registered.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Simulate form submission (replace with actual API call)
      // In production, you would upload files and send data to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 1. CALCULATE AGE FROM BIRTHDAY
      // ============================================
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const registrationFee = formData.registrationPackage === "vip" ? 190 : 109;

      let paymentProof = "";
      if (formData.modeOfPayment === "gcash" && formData.gcashProof) {
        paymentProof = await fileToBase64(formData.gcashProof);
      } else if (formData.modeOfPayment === "bank-transfer" && formData.bankProof) {
        paymentProof = await fileToBase64(formData.bankProof);
      }

      const clientRegistrationReference = `ZUMBA-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;
      const submittedPaymentReference =
        formData.modeOfPayment === "cash"
          ? `CASH-${clientRegistrationReference}`
          : formData.paymentReference;

      const jsonBody = {
        // ID is auto-generated
        registrationReference: clientRegistrationReference,
        paymentReference: submittedPaymentReference,
        payment_reference: submittedPaymentReference,
        ...(formData.modeOfPayment === "cash" ? {} : { paymentProof }),
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthday: formData.birthday, // Format: YYYY-MM-DD
        age: age,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        barangay: formData.barangay,
        instructorName: formData.instructorName || null,
        civilStatus: formData.civilStatus || "single",
        registrationPackage: formData.registrationPackage || "regular",
        registrationFee: registrationFee,
        paymentAmount: paymentAmountCents / 100,
        paymentDate: formData.paymentDate,
        payment_date: formData.paymentDate,
        paymentMethod: formData.modeOfPayment?.toUpperCase() || "UNSPECIFIED",
        paymentStatus: "PENDING",
        registrationStatus: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // const response = await fetch(
      //   "http://localhost:8080/zumba/addRegistration",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(jsonBody),
      //   },
      // );

      const response = await fetch(
        //"https://oyster-app-uv94u.ondigitalocean.app/zumba/addRegistration", //for local host
        "https://cleanitapiwebservice-v52dc.ondigitalocean.app/zumba/addRegistration",
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
        let errorData: Record<string, unknown> = {};
        try {
          const parsedError: unknown = JSON.parse(responseText);
          if (parsedError && typeof parsedError === "object" && !Array.isArray(parsedError)) {
            errorData = parsedError as Record<string, unknown>;
          }
        } catch {
          // Use the plain response text below when the API does not return JSON.
        }
        const serverMessage = [errorData.message, errorData.error, errorData.detail].find(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        );
        const errorText = `${responseText} ${JSON.stringify(errorData)}`.toLowerCase();

        const isDuplicatePhone =
          /(?:phone|mobile)(?:\s+number)?[^.\n]{0,50}(?:already registered|already exists|duplicate)|duplicate[^.\n]{0,50}(?:phone|mobile)/i.test(
            errorText,
          );
        const isDuplicateRegistration =
          /already registered|duplicate registration|registration.*already exists/i.test(errorText);

        if (isDuplicatePhone || isDuplicateRegistration) {
          if (isDuplicatePhone || (await checkForDuplicatePhone())) {
            setSubmitError("Phone number already registered.");
            return;
          }

          setSubmitError(
            serverMessage ||
              "The registration service rejected this registration. Please check the submitted details.",
          );
          return;
        }

        const fieldName =
          typeof errorData.field === "string"
            ? errorData.field
            : typeof errorData.fieldName === "string"
              ? errorData.fieldName
              : "";
        const knownFields = [
          "firstName",
          "lastName",
          "birthday",
          "email",
          "phoneNumber",
          "barangay",
          "civilStatus",
          "registrationPackage",
          "modeOfPayment",
          "gcashProof",
          "bankProof",
        ];

        if (knownFields.includes(fieldName)) {
          const fieldError = `Please review your ${fieldName.replace(/([A-Z])/g, " $1").toLowerCase()}.`;
          const mappedErrors = { [fieldName]: fieldError };
          setErrors(mappedErrors);
        }

        const fallbackMessage = responseText.trim().startsWith("<") ? "" : responseText.trim();
        throw new Error(
          (serverMessage || fallbackMessage).slice(0, 240) ||
            `Registration request failed (HTTP ${response.status}).`,
        );
      }

      const result = await response.json();
      console.log("Registration successful:", result);

      const returnedRegistrationReference =
        typeof result === "string"
          ? result
          : result?.registrationReference ||
            result?.data?.registrationReference ||
            result?.result?.registrationReference;

      setRegistrationReference(returnedRegistrationReference);

      try {
        const priorRegistrations = JSON.parse(localStorage.getItem("zumbaRegistrations") ?? "[]");
        const storedRegistrations = Array.isArray(priorRegistrations) ? priorRegistrations : [];
        storedRegistrations.push({
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthday: formData.birthday,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          paymentReference: submittedPaymentReference,
          registeredAt: new Date().toISOString(),
        });
        localStorage.setItem("zumbaRegistrations", JSON.stringify(storedRegistrations));
      } catch {
        // Ignore local persistence failures.
      }

      // Here you would typically:
      // 1. Upload files to a storage service (AWS S3, Firebase, etc.)
      // 2. Send form data to your backend
      // 3. Handle the response

      //send a json to http://localhost:8080/zumba/addRegistration
      //json body should be in the same pattern with ZumbaFitfile
      //method should be post

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message !== "Registration request failed"
          ? error.message
          : "We were unable to complete your registration. Please review the information provided and try again.",
      );
      console.error("Form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const registrationFee = formData.registrationPackage
    ? packagePrices[formData.registrationPackage]
    : 0;

  if (IS_ZUMBA_REGISTRATION_CLOSED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-900 via-blue-900 to-purple-800 px-4 py-12">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="h-40 overflow-hidden sm:h-48 md:h-56 lg:h-64">
            <img
              src="/assets/zumba-cleanit.png"
              alt="Zumba Fit by CleanIt"
              className="h-full w-full object-cover object-center"
              onError={event => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="p-6 text-center sm:p-8 md:p-10">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#B42318]" />
            <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              Registration Closed
            </h1>
            <p className="text-base text-gray-600 sm:text-lg">
              {ZUMBA_REGISTRATION_CLOSED_MESSAGE}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-linear-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center px-4 py-12 min-h-screen">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="relative mb-6 overflow-hidden rounded-2xl px-2 py-5">
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <h2 className="relative text-2xl font-bold text-gray-900 -mt-2">
              Registration Successful!
            </h2>
          </div>
          <p className="text-gray-600 mb-8">
            Thank you for registering for Zumba Fit by CleanIt. We look forward to seeing you at
            the event!
          </p>
          <div className="mb-6 overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
                Registration confirmed
              </p>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="px-5 py-5">
              <p className="text-center text-2xl font-bold text-gray-600 mb-2 -mt-2">
                <span className="font-semibold text-gray-900"></span>{" "}
                {formData.registrationPackage === "regular" ? "Regular" : "VIP"}
              </p>
              <p className="text-sm text-gray-600 mb-5">
                <span className="font-semibold text-gray-900">Name:</span> {formData.firstName}{" "}
                {formData.lastName}
              </p>
              <div className="rounded-xl border-2 border-dashed border-purple-400 bg-white px-4 py-5 text-center shadow-sm">
                <p className="mb-2 text-sm font-semibold text-gray-600">Your Raffle Number</p>
                <p className="break-all text-3xl font-black tracking-[0.12em] text-purple-800">
                  {registrationReference}
                </p>
                <p className="mt-2 text-xs text-gray-500">Please save this number for the event.</p>
              </div>
              {formData.modeOfPayment === "cash" && (
                <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-left text-sm leading-relaxed text-amber-950">
                  Please save this screenshot as proof of your registration and for your cash
                  payment.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                firstName: "",
                lastName: "",
                birthday: "",
                email: "",
                phoneNumber: "",
                barangay: "",
                instructorName: "",
                civilStatus: null,
                registrationPackage: null,
                modeOfPayment: null,
                gcashProof: null,
                bankProof: null,
                paymentReference: "",
                paymentDate: null,
              });
              setPaymentProofDate(null);
              setPaymentProofAmountCents(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Register Another Person
          </button>

          {/* CleanIt App Promotion - compact promotional section */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-purple-50 to-indigo-50 p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-700">
                  CleanIt App
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  Want to experience more from CleanIt?
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 shadow-inner">
                <span className="text-sm font-black">✦</span>
              </div>
            </div>

            <p className="mb-4 text-sm leading-6 text-gray-600">
              Get the CleanIt mobile app and conveniently access CleanIt&apos;s services from your
              phone anytime, anywhere.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.cleanit.activities"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 rounded-xl bg-black px-3 py-3 text-white transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95 shadow-sm"
              >
                <img
                  src={playStoreBadge}
                  alt="Google Play"
                  className="h-8 w-auto object-contain"
                />
                <span className="text-left leading-tight">
                  <span className="block text-[9px] font-medium uppercase tracking-[0.12em] text-white/70">
                    Get it on
                  </span>
                  <span className="block text-sm font-semibold">Google Play</span>
                </span>
              </a>

              <a
                href="https://apps.apple.com/ph/app/clean-it-mobile-app/id6774019021"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 rounded-xl bg-gray-900 px-3 py-3 text-white transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95 shadow-sm"
              >
                <img src={appStoreBadge} alt="App Store" className="h-8 w-auto object-contain" />
                <span className="text-left leading-tight">
                  <span className="block text-[9px] font-medium uppercase tracking-[0.12em] text-white/70">
                    Download on
                  </span>
                  <span className="block text-sm font-semibold">App Store</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-linear-to-br from-purple-900 via-blue-900 to-purple-800 py-8 md:py-10 lg:py-12">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-3">
            Zumba Fit by CleanIt
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-purple-400 font-bold mb-3 md:mb-4">
            Registration Form
          </p>
          <p className="text-purple-200 text-base sm:text-lg max-w-lg mx-auto">
            Secure your slot and enjoy a fun-filled Zumba experience with CleanIt!
          </p>
        </div>
 
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Banner Image - Inside Card */}
          <div className="overflow-hidden h-40 sm:h-48 md:h-56 lg:h-64">
            <img
              src="/assets/zumba-cleanit.png"
              alt="Zumba Fit by CleanIt"
              className="w-full h-full object-cover"
              onError={e => {
                // Hide image if not found
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 md:p-10">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              {submitError && submitError !== "This payment reference has already been used." && (
                <Alert
                  ref={submitErrorRef}
                  tabIndex={-1}
                  className="border-[#B42318] bg-[#FEF3F2] text-[#B42318]"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Event Information - highlighted card above packages */}
              <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-xl p-5 sm:p-6 mb-4">
                <h4 className="text-sm font-semibold text-purple-800">EVENT INFORMATION</h4>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      {/* Calendar icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="currentColor"
                        aria-hidden
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path d="M7 10h5v5H7z" opacity="0.9" />
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V9h14v9z" />
                      </svg>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="mb-1 text-xs font-bold text-black">Date & Time</p>
                      <p className="text-sm leading-5 text-gray-900">
                        October 11, 2026 <br /> 9:30 A.M Onwards
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      {/* Location / Pin icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="currentColor"
                        aria-hidden
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                      </svg>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="mb-1 text-xs font-bold text-black">Location</p>
                      <p className="text-sm leading-5 text-gray-900">
                        Ground Floor, Trade Hall, Robinsons Novaliches
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      {/* Phone icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="currentColor"
                        aria-hidden
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.55.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.55 1 1 0 0 1-.24 1.01l-2.21 2.23z" />
                      </svg>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="mb-1 text-xs font-bold text-black">Contact</p>
                      <p className="text-sm leading-5 text-gray-900">
                        <a href="tel:09171802216" className="hover:underline">
                          0917 180 2216
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      {/* Mail icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="currentColor"
                        aria-hidden
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="mb-1 text-xs font-bold text-black">Email</p>
                      <p className="break-all text-sm leading-5 text-gray-900">
                        <a href="mailto:info@cleanit.business" className="hover:underline">
                          info@cleanit.business
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Packages Section */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Registration Packages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Regular Package */}
                  <button
                    type="button"
                    name="registrationPackage"
                    onClick={() => handlePackageSelect("regular")}
                    aria-invalid={!!errors.registrationPackage}
                    aria-describedby={
                      errors.registrationPackage ? "registrationPackage-error" : undefined
                    }
                    className={`p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.registrationPackage === "regular"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Regular</h4>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">₱109</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          formData.registrationPackage === "regular"
                            ? "border-purple-600 bg-purple-600"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.registrationPackage === "regular" && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5">
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Tote Bag</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Key Chain</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Sticker Set</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Headband</span>
                      </li>
                      {/* <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Wristband</span>
                      </li> */}
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>1 Raffle Ticket</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Certificate of Participation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Snacks & Drinks</span>
                      </li>
                    </ul>
                  </button>

                  {/* VIP Package */}
                  <button
                    type="button"
                    name="registrationPackage"
                    onClick={() => handlePackageSelect("vip")}
                    aria-invalid={!!errors.registrationPackage}
                    aria-describedby={
                      errors.registrationPackage ? "registrationPackage-error" : undefined
                    }
                    className={`p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.registrationPackage === "vip"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">VIP</h4>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">₱190</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          formData.registrationPackage === "vip"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.registrationPackage === "vip" && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2 font-bold">•</span>
                        <span>Tote Bag</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Key Chain</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2 font-bold">•</span>
                        <span>Sticker Set</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2 font-bold">•</span>
                        <span>Headband</span>
                      </li>
                      {/* <li className="flex items-start">
                        <span className="text-blue-600 mr-2 font-bold">•</span>
                        <span>Wristband</span>
                      </li> */}
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2 font-bold">•</span>
                        <span className="font-bold">Dri-fit Shirt</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2 font-bold">•</span>
                        <span>1 Raffle Ticket</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Certificate of Participation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 mr-2 font-bold">•</span>
                        <span>Snacks & Drinks</span>
                      </li>
                    </ul>
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Contest Categories</h4>
                    <p className="text-sm italic text-purple-700/80">
                      Vouchers, Trophies, and Medals
                    </p>
                  </div>

                  <div className="rounded-lg border border-purple-100 bg-purple-50/40 px-2.5 py-2 text-xs font-medium text-purple-800 shadow-sm">
                    💡 Click a card to flip and see the criteria
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {contestCategories.map(category => {
                      const isFlipped = !!flippedCards[category.title];

                      return (
                        <button
                          key={category.title}
                          type="button"
                          onClick={() =>
                            setFlippedCards(prev => ({
                              ...prev,
                              [category.title]: !prev[category.title],
                            }))
                          }
                          className="relative h-full min-h-[62px] w-full text-left cursor-pointer [perspective:1000px]"
                        >
                          <div
                            className={`relative h-full w-full rounded-lg transition-transform duration-600 [transform-style:preserve-3d] ${
                              isFlipped ? "[transform:rotateY(180deg)]" : ""
                            }`}
                          >
                            <div className="absolute inset-0 flex items-center rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm [backface-visibility:hidden]">
                              <span className="mr-2 text-base flex-shrink-0" aria-hidden="true">
                                ⭐
                              </span>
                              <span className="line-clamp-2">{category.title}</span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-blue-200 bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2.5 text-center text-white shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                              <span className="text-[11px] font-medium leading-tight">
                                {category.criteria}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        setFlippedCards(prev => ({
                          ...prev,
                          [centeredContestCategory.title]: !prev[centeredContestCategory.title],
                        }))
                      }
                      className="relative h-[84px] w-full text-left cursor-pointer [perspective:1000px] sm:col-span-2 lg:col-span-1 lg:col-start-2"
                    >
                      <div
                        className={`relative h-full w-full rounded-lg transition-transform duration-600 [transform-style:preserve-3d] ${
                          flippedCards[centeredContestCategory.title]
                            ? "[transform:rotateY(180deg)]"
                            : ""
                        }`}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-2.5 text-center text-sm font-medium text-gray-800 shadow-sm [backface-visibility:hidden]">
                          <span className="text-base flex-shrink-0" aria-hidden="true">
                            ⭐
                          </span>
                          <span className="line-clamp-2">{centeredContestCategory.title}</span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-blue-200 bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2.5 text-center text-white shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                          <span className="text-[11px] font-medium leading-tight">
                            {centeredContestCategory.criteria}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-300 via-orange-200 to-pink-200 p-[1px] shadow-lg shadow-orange-200/50 sm:p-[1.5px]">
                  <div className="flex items-start gap-3 rounded-[15px] bg-gradient-to-r from-[#fffaf0] via-[#fff1d6] to-[#fdf2f8] p-4 sm:p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-xl shadow-md shadow-pink-300/70">
                      🎁
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-700">
                        Raffle &amp; Prizes
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-800 sm:text-base">
                        Stay tuned for the mechanics &amp; prizes during the event.
                      </p>
                    </div>
                  </div>
                </div>
                {errors.registrationPackage && (
                  <p id="registrationPackage-error" className="text-[#B42318] text-sm font-medium">
                    {errors.registrationPackage}
                  </p>
                )}
              </div>

              {/* Personal Information Section */}
              <div className="space-y-3 md:space-y-4 border-t pt-6 md:pt-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h3>

                {/* First Name and Last Name - Side by side on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? "firstName-error" : undefined}
                      className={`w-full px-4 py-2 rounded-lg border-2 transition-colors text-black placeholder-gray-400 ${
                        errors.firstName
                          ? "border-[#B42318] bg-[#FEF3F2]"
                          : "border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                      } outline-none`}
                    />
                    {errors.firstName && (
                      <p id="firstName-error" className="text-[#B42318] text-sm font-medium mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Last Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? "lastName-error" : undefined}
                      className={`w-full px-4 py-2 rounded-lg border-2 transition-colors text-black placeholder-gray-400 ${
                        errors.lastName
                          ? "border-[#B42318] bg-[#FEF3F2]"
                          : "border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                      } outline-none`}
                    />
                    {errors.lastName && (
                      <p id="lastName-error" className="text-[#B42318] text-sm font-medium mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <label htmlFor="birthday" className="block text-sm font-semibold text-gray-900 mb-2">
                    Birthday <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    onClick={event => {
                      const input = event.currentTarget;
                      input.focus();
                      input.showPicker?.();
                    }}
                    min="1926-01-01"
                    max={(() => {
                      const maxDate = new Date();
                      maxDate.setFullYear(maxDate.getFullYear() - 16);
                      return maxDate.toISOString().split("T")[0];
                    })()}
                    aria-invalid={!!errors.birthday}
                    aria-describedby={errors.birthday ? "birthday-error" : undefined}
                    className={`w-full cursor-pointer px-4 py-2 rounded-lg border-2 transition-colors text-black ${
                      errors.birthday
                        ? "border-[#B42318] bg-[#FEF3F2]"
                        : "border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                    } outline-none`}
                  />
                  {errors.birthday && (
                    <p id="birthday-error" className="text-[#B42318] text-sm font-medium mt-1">
                      {errors.birthday}
                    </p>
                  )}
                </div>

                {/* Age Display - Calculated from Birthday */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Age</label>
                  <div className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 bg-gray-100 text-black font-semibold">
                    {formData.birthday ? `${calculateAge(formData.birthday)} years old` : "--"}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-colors text-black placeholder-gray-400 ${
                      errors.email
                        ? "border-[#B42318] bg-[#FEF3F2]"
                        : "border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                    } outline-none`}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-[#B42318] text-sm font-medium mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="09XXXXXXXXX"
                    inputMode="numeric"
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-colors text-black placeholder-gray-400 ${
                      errors.phoneNumber
                        ? "border-[#B42318] bg-[#FEF3F2]"
                        : "border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                    } outline-none`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 09XXXXXXXXX (11 digits)</p>
                  {errors.phoneNumber && (
                    <p id="phoneNumber-error" className="text-[#B42318] text-sm font-medium mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Barangay */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Barangay <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    placeholder="Enter your barangay"
                    aria-invalid={!!errors.barangay}
                    aria-describedby={errors.barangay ? "barangay-error" : undefined}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-colors text-black placeholder-gray-400 ${
                      errors.barangay
                        ? "border-[#B42318] bg-[#FEF3F2]"
                        : "border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                    } outline-none`}
                  />
                  {errors.barangay && (
                    <p id="barangay-error" className="text-[#B42318] text-sm font-medium mt-1">
                      {errors.barangay}
                    </p>
                  )}
                </div>

                {/* Civil Status */}
                <div ref={civilStatusRef}>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Civil Status <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      name="civilStatus"
                      onClick={() => setIsCivilStatusOpen(!isCivilStatusOpen)}
                      aria-invalid={!!errors.civilStatus}
                      aria-describedby={errors.civilStatus ? "civilStatus-error" : undefined}
                      className={`w-full px-4 py-2 pr-10 rounded-lg border-2 transition-colors text-black text-left appearance-none cursor-pointer ${
                        errors.civilStatus
                          ? "border-[#B42318] bg-[#FEF3F2]"
                          : "border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white"
                      } outline-none focus:border-purple-500 focus:bg-white`}
                    >
                      {formData.civilStatus
                        ? {
                            single: "Single",
                            married: "Married",
                            widowed: "Widowed",
                            divorced: "Divorced",
                            separated: "Separated",
                          }[formData.civilStatus]
                        : "Select a civil status"}
                    </button>
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform duration-300 ${
                        isCivilStatusOpen ? "rotate-180" : ""
                      }`}
                    />

                    {/* Dropdown Menu */}
                    {isCivilStatusOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
                        {[
                          { value: "single" as const, label: "Single" },
                          { value: "married" as const, label: "Married" },
                          { value: "widowed" as const, label: "Widowed" },
                          { value: "divorced" as const, label: "Divorced" },
                          { value: "separated" as const, label: "Separated" },
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleCivilStatusSelect(option.value);
                              setIsCivilStatusOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left transition-colors ${
                              formData.civilStatus === option.value
                                ? "bg-purple-100 text-purple-900 font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                            } first:rounded-t-md last:rounded-b-md`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.civilStatus && (
                    <p id="civilStatus-error" className="text-[#B42318] text-sm font-medium mt-1">
                      {errors.civilStatus}
                    </p>
                  )}
                </div>

                {/* Instructor Name (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Instructor Name <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                    placeholder="Enter instructor name (if applicable)"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 bg-gray-50 focus:border-purple-500 focus:bg-white outline-none transition-colors text-black placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Mode of Payment Section */}
              <div className="space-y-3 md:space-y-4 border-t pt-6 md:pt-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Mode of Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {["cash", "gcash", "bank-transfer"].map(method => (
                    <button
                      key={method}
                      type="button"
                      name="modeOfPayment"
                      onClick={() =>
                        handlePaymentMethodSelect(method as "cash" | "gcash" | "bank-transfer")
                      }
                      aria-invalid={!!errors.modeOfPayment}
                      aria-describedby={errors.modeOfPayment ? "modeOfPayment-error" : undefined}
                      className={`p-3 sm:p-4 rounded-lg border-2 font-semibold transition-all text-sm sm:text-base ${
                        formData.modeOfPayment === method
                          ? "border-purple-600 bg-purple-50 text-purple-900"
                          : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
                      }`}
                    >
                      {method === "cash" && "Cash"}
                      {method === "gcash" && "GCash"}
                      {method === "bank-transfer" && "Bank Transfer"}
                    </button>
                  ))}
                </div>
                {errors.modeOfPayment && (
                  <p id="modeOfPayment-error" className="text-[#B42318] text-sm font-medium">
                    {errors.modeOfPayment}
                  </p>
                )}

                {/* GCash Payment */}
                {formData.modeOfPayment === "gcash" && (
                  <div className="mt-6 space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900">GCash Payment</h4>
                    <p className="text-sm text-gray-700">Scan the QR code below to pay.</p>
                    <div className="flex justify-center my-6">
                      <img
                        src={modgcashQR}
                        alt="GCash QR Code"
                        className="max-w-sm w-full h-auto rounded-lg border-2 border-gray-300"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = "none";
                          // Show error message
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const errorDiv = document.createElement("div");
                            errorDiv.className = "text-center text-red-600 p-4";
                            errorDiv.textContent = "QR Code image not found";
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                    </div>
                    <div className="border-t border-blue-200 pt-4">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Upload Proof of Payment <span className="text-red-600">*</span>
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        Please upload a clear screenshot/photo of your payment confirmation.
                      </p>
                      <div
                        onClick={() => gcashFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          errors.gcashProof
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"
                        }`}
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        {formData.gcashProof ? (
                          <p className="text-sm font-medium text-gray-900">
                            {formData.gcashProof.name}
                          </p>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={gcashFileInputRef}
                        type="file"
                        name="gcashProof"
                        accept="image/*"
                        onChange={e => handleFileChange(e, "gcash")}
                        aria-invalid={!!errors.gcashProof}
                        aria-describedby={errors.gcashProof ? "gcashProof-error" : undefined}
                        className="hidden"
                      />
                      {formData.gcashProof && formData.modeOfPayment === "gcash" && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            Extracted GCash Reference Number
                          </p>
                          <p className="mt-1 break-all text-sm font-semibold text-emerald-900">
                            {formData.paymentReference || "Not detected"}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-emerald-200 pt-3">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                Payment date
                              </p>
                              <p className="mt-1 text-sm font-medium text-emerald-900">
                                {formatPaymentProofDate(paymentProofDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                Detected amount
                              </p>
                              <p className="mt-1 text-sm font-medium text-emerald-900">
                                {formatPaymentProofAmount(paymentProofAmountCents)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {errors.gcashProof && (
                        <p
                          id="gcashProof-error"
                          className="text-[#B42318] text-sm font-medium mt-2"
                        >
                          {errors.gcashProof}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Transfer Payment */}
                {formData.modeOfPayment === "bank-transfer" && (
                  <div className="mt-6 space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Bank Transfer</h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Bank Name
                      </label>
                      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium">
                        TOPBANK PH
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Account Name
                      </label>
                      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium">
                        SMARTVEND SYSTEM CORPORATION
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Account Number
                      </label>
                      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium">
                        {/* 022-209-00005-8 */} 022-118-00003-4
                        {/* 000-000-00000-0 */}
                      </div>
                    </div>
                    <div className="border-t border-blue-200 pt-4">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Upload Proof of Payment <span className="text-red-600">*</span>
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        Please upload a clear screenshot/photo of your payment confirmation.
                      </p>
                      <div
                        onClick={() => bankFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          errors.bankProof
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"
                        }`}
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        {formData.bankProof ? (
                          <p className="text-sm font-medium text-gray-900">
                            {formData.bankProof.name}
                          </p>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG & JPG, up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={bankFileInputRef}
                        type="file"
                        name="bankProof"
                        accept="image/*"
                        onChange={e => handleFileChange(e, "bank")}
                        aria-invalid={!!errors.bankProof}
                        aria-describedby={errors.bankProof ? "bankProof-error" : undefined}
                        className="hidden"
                      />
                      {formData.bankProof && formData.modeOfPayment === "bank-transfer" && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            Extracted Transaction Number
                          </p>
                          <p className="mt-1 break-all text-sm font-semibold text-emerald-900">
                            {formData.paymentReference || "Not detected"}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-emerald-200 pt-3">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                Payment date
                              </p>
                              <p className="mt-1 text-sm font-medium text-emerald-900">
                                {formatPaymentProofDate(paymentProofDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                Detected amount
                              </p>
                              <p className="mt-1 text-sm font-medium text-emerald-900">
                                {formatPaymentProofAmount(paymentProofAmountCents)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {errors.bankProof && (
                        <p id="bankProof-error" className="text-[#B42318] text-sm font-medium mt-2">
                          {errors.bankProof}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {submitError === "This payment reference has already been used." && (
                  <Alert
                    ref={submitErrorRef}
                    tabIndex={-1}
                    className="border-[#B42318] bg-[#FEF3F2] text-[#B42318]"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Registration Summary */}
              {formData.registrationPackage && (
                <div className="pt-6 md:pt-8">
                  <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 md:p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-gray-700">Registration Package:</span>
                        <span className="font-semibold text-gray-900">
                          {formData.registrationPackage === "regular" ? "Regular" : "VIP"}
                        </span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-gray-200 text-sm md:text-base">
                        <span className="text-gray-700">Registration Fee:</span>
                        <span className="font-bold text-lg text-purple-600">₱{registrationFee}</span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-gray-700">Mode of Payment:</span>
                        <span className="font-semibold text-gray-900">
                          {formData.modeOfPayment === "gcash"
                            ? "GCash"
                            : formData.modeOfPayment === "bank-transfer"
                              ? "Bank Transfer"
                              : formData.modeOfPayment === "cash"
                                ? "Cash"
                              : "Not selected"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 sm:py-4 rounded-lg font-bold text-white text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6 md:mt-8 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95 transform"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "REGISTER NOW"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 md:mt-8 text-center text-purple-100 text-xs sm:text-sm">
          <p>Serbisyong So Sulit! Sayaw, Galaw at Saya! 💜</p>
        </div>
      </div>
    </div>
  );
}
