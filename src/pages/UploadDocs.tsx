import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle, Upload, X, Plus, ArrowLeft, CircleCheck, Camera, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileQRBanner from "@/components/upload/MobileQRBanner";
import DocumentCameraCapture from "@/components/upload/DocumentCameraCapture";
import { getDocDimensions } from "@/lib/documentDimensions";
import harteLogoFallback from "@/assets/harte-logo-white.png";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const DOC_TYPES = [
  { key: "drivers_license_front", label: "Driver's License (Front)", emoji: "🪪", ocr: true },
  { key: "drivers_license_back", label: "Driver's License (Back)", emoji: "🪪", ocr: false },
  { key: "registration", label: "Registration", emoji: "📋", ocr: false },
  { key: "title_front", label: "Title (Front)", emoji: "📄", ocr: true },
  { key: "title_back", label: "Title (Back)", emoji: "📄", ocr: false },
];

interface SubmissionInfo {
  id: string;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  name: string | null;
  photos_uploaded: boolean;
  state: string | null;
  zip: string | null;
  vin: string | null;
}

const UploadDocs = () => {
  const { token } = useParams<{ token: string }>();
  const { config } = useSiteConfig();
  const [submission, setSubmission] = useState<SubmissionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ file: File; docType: string; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [activeDocType, setActiveDocType] = useState<string>("");
  const [cameraDocType, setCameraDocType] = useState<string | null>(null);
  const [vinStatus, setVinStatus] = useState<"match" | "mismatch" | "no_vin_on_file" | "not_legible" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!token) { setError("Invalid link."); setLoading(false); return; }
      const { data, error: err } = await supabase
        .rpc("get_submission_by_token", { _token: token })
        .maybeSingle();
      if (err || !data) { setError("Submission not found. Please check your link."); }
      else { setSubmission(data as unknown as SubmissionInfo); }
      setLoading(false);
    };
    fetchSubmission();
  }, [token]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILES = 30;

  const addFileEntry = useCallback((file: File, docType: string, preview: string) => {
    setFiles(prev => {
      if (prev.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} documents allowed.`);
        return prev;
      }
      return [...prev, { file, docType, preview }];
    });
  }, []);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles || !activeDocType) return;
    const added = Array.from(newFiles).filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        setError(`File "${f.name}" exceeds 10MB limit.`);
        return false;
      }
      return true;
    });
    if (files.length + added.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} documents allowed.`);
      return;
    }
    added.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => {
        addFileEntry(f, activeDocType, f.type.startsWith("image/") ? (e.target?.result as string) : "");
      };
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!submission || files.length === 0) return;
    setUploading(true);
    let dlFrontPath: string | null = null;
    let titleFrontPath: string | null = null;
    try {
      for (const { file, docType } of files) {
        const ext = file.name.split(".").pop();
        const path = `${token}/${docType}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("customer-documents")
          .upload(path, file, { contentType: file.type });
        if (uploadErr) throw uploadErr;
        if (docType === "drivers_license_front") dlFrontPath = path;
        if (docType === "title_front") titleFrontPath = path;
      }
      await supabase.rpc("mark_docs_uploaded", { _token: token! });
      // Fire docs_uploaded staff notification
      if (submission?.id) {
        supabase.functions.invoke("send-notification", {
          body: { trigger_key: "docs_uploaded", submission_id: submission.id },
        }).catch(console.error);
      }

      // Trigger OCR on driver's license front if uploaded
      if (dlFrontPath) {
        try {
          const { data: signedData } = await supabase.storage
            .from("customer-documents")
            .createSignedUrl(dlFrontPath, 300);
          if (signedData?.signedUrl) {
            await supabase.functions.invoke("parse-drivers-license", {
              body: { imageUrl: signedData.signedUrl, submissionToken: token },
            });
          }
        } catch (ocrErr) {
          console.warn("DL OCR auto-fill skipped:", ocrErr);
        }
      }

      // Trigger VIN verification on title front if uploaded
      if (titleFrontPath) {
        try {
          const { data: signedData } = await supabase.storage
            .from("customer-documents")
            .createSignedUrl(titleFrontPath, 300);
          if (signedData?.signedUrl) {
            const { data: vinResult } = await supabase.functions.invoke("parse-title-vin", {
              body: { imageUrl: signedData.signedUrl, submissionToken: token },
            });
            if (vinResult?.vin_match) {
              setVinStatus(vinResult.vin_match);
            }
          }
        } catch (ocrErr) {
          console.warn("Title VIN verification skipped:", ocrErr);
        }
      }

      setDone(true);
    } catch {
      setError("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  const triggerUpload = (docType: string) => {
    setActiveDocType(docType);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const triggerCamera = (docType: string) => {
    setCameraDocType(docType);
  };

  const handleCameraCapture = (file: File, preview: string) => {
    if (cameraDocType) {
      addFileEntry(file, cameraDocType, preview);
    }
    setCameraDocType(null);
  };

  const filesPerType = (type: string) => files.filter(f => f.docType === type);

  // Completion check: DL front + DL back + (registration OR (title front + title back))
  const isComplete = useMemo(() => {
    const hasDLFront = filesPerType("drivers_license_front").length > 0;
    const hasDLBack = filesPerType("drivers_license_back").length > 0;
    const hasRegistration = filesPerType("registration").length > 0;
    const hasTitleFront = filesPerType("title_front").length > 0;
    const hasTitleBack = filesPerType("title_back").length > 0;
    return hasDLFront && hasDLBack && (hasRegistration || (hasTitleFront && hasTitleBack));
  }, [files]);

  // Determine customer state for guide dimensions
  const customerState = submission?.state || null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
    </div>
  );

  if (error && !submission) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-foreground mb-2">Oops!</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-sm">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Documents Received!</h1>
        <p className="text-muted-foreground">
          Thank you{submission?.name ? `, ${submission.name}` : ""}! We've received your documents
          {submission?.vehicle_year && ` for your ${submission.vehicle_year} ${submission.vehicle_make} ${submission.vehicle_model}`}.
          Our team will review them shortly.
        </p>

        {/* VIN verification status */}
        {vinStatus && (
          <div className={`mt-4 rounded-lg p-3 text-sm flex items-center gap-2 ${
            vinStatus === "match"
              ? "bg-success/10 text-success"
              : vinStatus === "mismatch"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
          }`}>
            {vinStatus === "match" ? (
              <>
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>VIN verified — title matches our records ✓</span>
              </>
            ) : vinStatus === "mismatch" ? (
              <>
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>VIN on title doesn't match our records. Our team will review this.</span>
              </>
            ) : vinStatus === "no_vin_on_file" ? (
              <>
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>VIN captured from your title and added to your file.</span>
              </>
            ) : (
              <span>VIN could not be read from title — our team will verify manually.</span>
            )}
          </div>
        )}

        <Link to={`/my-submission/${token}`}>
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to My Submission
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Camera capture overlay */}
      {cameraDocType && (
        <DocumentCameraCapture
          docLabel={DOC_TYPES.find(d => d.key === cameraDocType)?.label || "Document"}
          dimensions={getDocDimensions(cameraDocType, customerState)}
          onCapture={handleCameraCapture}
          onClose={() => setCameraDocType(null)}
        />
      )}

      <div className="bg-primary text-primary-foreground px-6 py-4 mb-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to={`/my-submission/${token}`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src={config.logo_white_url || harteLogoFallback} alt={config.dealership_name} className="h-[70px] w-auto" />
          <h1 className="font-bold text-lg">Upload Documents</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center mb-6">
          <FileText className="w-12 h-12 text-accent mx-auto mb-3" />
          {submission && (
            <p className="text-muted-foreground text-sm">
              {submission.vehicle_year} {submission.vehicle_make} {submission.vehicle_model}
            </p>
          )}
        </div>

        <MobileQRBanner url={`${window.location.origin}/docs/${token}`} />

        {/* Completion banner */}
        {isComplete && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-4 flex items-center gap-3">
            <CircleCheck className="w-6 h-6 text-success flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success">All required documents added!</p>
              <p className="text-xs text-muted-foreground">You can still add more if needed.</p>
            </div>
          </div>
        )}

        <div className={`bg-card rounded-xl p-5 shadow-lg mb-6 transition-colors ${isComplete ? "ring-2 ring-success/40" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-card-foreground">Documents needed:</h3>
            {isComplete && <span className="text-xs bg-success/10 text-success font-semibold px-2 py-0.5 rounded-full">Complete ✓</span>}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Required: Driver's license (front & back) + either registration or title (front & back)
          </p>
          <div className="space-y-3">
            {DOC_TYPES.map(dt => {
              const typeFiles = filesPerType(dt.key);
              const hasFile = typeFiles.length > 0;
              return (
                <div key={dt.key} className={`border rounded-lg p-3 transition-colors ${hasFile ? "border-success/40 bg-success/5" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-card-foreground flex items-center gap-1.5">
                      {hasFile ? <CheckCircle className="w-4 h-4 text-success" /> : null}
                      {dt.emoji} {dt.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerCamera(dt.key)}
                        className="gap-1 text-xs"
                      >
                        <Camera className="w-3 h-3" /> Capture
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => triggerUpload(dt.key)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-0.5" /> File
                      </Button>
                    </div>
                  </div>
                  {typeFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {typeFiles.map((f, i) => {
                        const globalIdx = files.indexOf(f);
                        return (
                          <div key={i} className="relative bg-muted rounded-md px-2 py-1 flex items-center gap-1.5 text-xs">
                            {f.preview ? (
                              <img src={f.preview} alt="" className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-muted-foreground max-w-[100px] truncate">{f.file.name}</span>
                            <button onClick={() => removeFile(globalIdx)} className="text-destructive hover:text-destructive/80">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />

        {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}

        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className={`w-full py-4 text-[17px] font-bold shadow-lg ${
            isComplete
              ? "bg-success hover:bg-success/90 text-success-foreground shadow-success/30"
              : "bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/30"
          }`}
        >
          {uploading ? "Uploading & verifying..." : `Upload ${files.length} Document${files.length !== 1 ? "s" : ""}`}
        </Button>

        <p className="text-center mt-4 text-[13px] text-muted-foreground">
          🔒 Your documents are securely uploaded and only used for your vehicle transaction.
        </p>
      </div>
    </div>
  );
};

export default UploadDocs;
