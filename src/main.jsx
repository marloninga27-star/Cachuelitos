import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Menu,
  Bell,
  ArrowLeft,
  Home,
  BriefcaseBusiness,
  UserRound,
  Store,
  GraduationCap,
  MapPin,
  CalendarDays,
  Clock3,
  Wallet,
  Search,
  Plus,
  ChevronRight,
  FileText,
  Upload,
  CheckCircle2,
  Users,
  ShieldCheck,
  LogOut,
  LockKeyhole,
  Eye,
  EyeOff,
  MessageCircle,
  Tag,
  Send,
  Phone,
  ClipboardList,
  AlertCircle,
  HardHat,
  Check,
  Filter,
} from "lucide-react";
import "./style.css";
import { supabase } from "./lib/supabaseClient";
const STORE = "cachuelitos_redesign_demo_v1";
const seed = {
  users: [
    {
      id: "admin",
      name: "Administrador",
      email: "admin@demo.local",
      role: "admin",
      verified: true,
      phone: "",
    },
    {
      id: "student",
      name: "Ana Quispe",
      email: "ana@demo.local",
      role: "estudiante",
      institution: "UNSCH",
      career: "Ingeniería de Sistemas",
      skills: "Inventarios, Soporte técnico",
      verified: true,
      verificationStatus: "aprobada",
      phone: "51987654321",
    },
    {
      id: "owner",
      name: "Tienda El Sol",
      email: "tienda@demo.local",
      role: "contratante",
      verified: true,
      phone: "51987654321",
    },
  ],
  jobs: [
    {
      id: "j1",
      owner: "owner",
      title: "Apoyo en inventario",
      description:
        "Se requiere apoyo para el conteo y registro de productos en la tienda.",
      zone: "Huamanga, Ayacucho",
      date: "2026-12-05",
      time: "8:00 a. m. – 5:00 p. m.",
      pay: 50,
      category: "Todos",
      phone: "51987654321",
      status: "abierto",
    },
    {
      id: "j2",
      owner: "owner",
      title: "Apoyo en evento",
      description: "Apoyo logístico en la organización de un evento local.",
      zone: "Centro Histórico, Ayacucho",
      date: "2026-12-07",
      time: "9:00 a. m. – 2:00 p. m.",
      pay: 45,
      category: "Eventos",
      phone: "51987654321",
      status: "abierto",
    },
    {
      id: "j3",
      owner: "owner",
      title: "Atención en tienda",
      description: "Atender clientes y organizar productos durante la tarde.",
      zone: "Huamanga, Ayacucho",
      date: "2026-12-10",
      time: "2:00 p. m. – 6:00 p. m.",
      pay: 40,
      category: "Ventas",
      phone: "51987654321",
      status: "abierto",
    },
  ],
  applications: [],
};
const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(STORE));
    return v?.users && v?.jobs && v?.applications ? v : seed;
  } catch {
    return seed;
  }
};
const categories = [
  ["Todos", BriefcaseBusiness],
  ["Ventas", Store],
  ["Eventos", CalendarDays],
  ["Otros", Tag],
];
const id = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
function App() {
  const [db, setDb] = useState(load),
    [uid, setUid] = useState(""),
    [screen, setScreen] = useState("welcome"),
    [role, setRole] = useState("estudiante"),
    [mode, setMode] = useState("login"),
    [form, setForm] = useState({}),
    [search, setSearch] = useState(""),
    [cat, setCat] = useState("Todos"),
    [selected, setSelected] = useState(null),
    [toast, setToast] = useState(""),
    [history, setHistory] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    [errors, setErrors] = useState({}),
    [photoError, setPhotoError] = useState("");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [reviewingStudent, setReviewingStudent] = useState(null);
  useEffect(() => {
    if (!user?.id) {
      setJobs([]);
      return;
    }

    let activo = true;

    const cargar = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, profiles:owner_id(full_name)")
        .order("created_at", { ascending: false });

      if (!activo) return;

      if (error) {
        console.error("Error al cargar cachuelos:", error);
        return;
      }

      setJobs(
        (data || []).map((j) => ({
          id: j.id,
          owner: j.owner_id,
          ownerName: j.profiles?.full_name || "Contratante",
          title: j.title,
          description: j.description,
          zone: j.zone,
          date: j.work_date,
          time: j.work_time,
          pay: Number(j.pay),
          category: j.category,
          phone: j.phone || "",
          status: j.status,
        })),
      );
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [user?.id]);
  useEffect(() => {
    if (!user?.id) {
      setApplications([]);
      return;
    }

    let activo = true;

    const cargar = async () => {
      const { data, error } = await supabase
        .from("applications")

        .select(
          `
  id,
  job_id,
  student_id,
  status,
  created_at,
  estudiante:profiles!applications_student_id_fkey (
  full_name,
  phone
)
`,
        )
        .order("created_at", { ascending: false });

      if (!activo) return;

      if (error) {
        console.error("Error al cargar postulaciones:", error);
      } else {
        setApplications(data || []);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [user?.id]);

  const job = jobs.find((x) => x.id === selected);

  const go = (s) => {
    if (s === "admin" && user?.role === "admin") {
      cargarVerificaciones();
    }

    if (s === "applications" && user?.id) {
      cargarPostulaciones();
    }

    setScreen(s);
    setForm({});
    setErrors({});
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async (authUser) => {
      const { data: perfil, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!activo) return;

      if (error || !perfil) {
        console.error("Error al cargar perfil:", error);
        setUser(null);
        setUid("");
        setAuthLoading(false);
        return;
      }

      const usuario = {
        id: perfil.id,
        name: perfil.full_name,
        email: authUser.email,
        role: perfil.role,
        phone: perfil.phone,
        institution: perfil.institution || "",
        career: perfil.career || "",
        skills: perfil.skills || "",
        verified: perfil.verified,
        verificationStatus: perfil.verification_status,
        avatarPath: perfil.avatar_path,
      };

      setUser(usuario);
      setUid(usuario.id);
      setScreen(usuario.role === "admin" ? "admin" : "home");
      setAuthLoading(false);
    };

    const iniciar = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!activo) return;

      if (error || !data.session?.user) {
        setUser(null);
        setUid("");
        setAuthLoading(false);
        return;
      }

      await cargarPerfil(data.session.user);
    };

    iniciar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!activo) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setUid("");
        setScreen("welcome");
        setAuthLoading(false);
      }

      if (event === "SIGNED_IN" && session?.user) {
        cargarPerfil(session.user);
      }
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  const cargarCachuelos = async () => {
    setJobsLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
      *,
      profiles:owner_id (full_name)
    `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar cachuelos:", error);
      setJobsLoading(false);
      return;
    }

    const ofertas = (data || []).map((j) => ({
      id: j.id,
      owner: j.owner_id,
      ownerName: j.profiles?.full_name || "Contratante",
      title: j.title,
      description: j.description,
      zone: j.zone,
      date: j.work_date,
      time: j.work_time,
      pay: Number(j.pay),
      category: j.category,
      phone: j.phone || "",
      status: j.status,
    }));

    setJobs(ofertas);
    setJobsLoading(false);
  };
  const cargarPostulaciones = async () => {
    if (!user?.id) {
      setApplications([]);
      return;
    }

    setApplicationsLoading(true);

    const { data, error } = await supabase
      .from("applications")

      .select(
        `
  id,
  job_id,
  student_id,
  status,
  created_at,
 estudiante:profiles!applications_student_id_fkey (
  full_name,
  phone
)
`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar postulaciones:", error);
      notice("No se pudieron cargar las postulaciones.");
    } else {
      setApplications(data || []);
    }

    setApplicationsLoading(false);
  };

  const save = (next) => {
    setDb(next);
    localStorage.setItem(STORE, JSON.stringify(next));
  };
  const notice = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 4300);
  };

  const field = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    const nombre = String(form.name || "").trim();
    const correo = String(form.email || "").trim();
    const celular = String(form.phone || "").trim();
    const password = String(form.password || "");

    if (mode === "register") {
      if (!nombre) {
        nuevosErrores.name = "Ingresa tus nombres y apellidos.";
      }

      if (!celular) {
        nuevosErrores.phone = "Ingresa tu número de celular.";
      } else if (!/^9\d{8}$/.test(celular)) {
        nuevosErrores.phone =
          "El celular debe tener 9 dígitos y comenzar con 9.";
      }

      if (role === "estudiante") {
        if (!String(form.institution || "").trim()) {
          nuevosErrores.institution = "Ingresa tu universidad o instituto.";
        }

        if (!String(form.career || "").trim()) {
          nuevosErrores.career = "Ingresa tu carrera profesional.";
        }
      }
    }

    if (!correo) {
      nuevosErrores.email = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      nuevosErrores.email = "Ingresa un correo electrónico válido.";
    }

    if (!password) {
      nuevosErrores.password = "Ingresa tu contraseña.";
    } else if (mode === "register" && password.length < 8) {
      nuevosErrores.password =
        "La contraseña debe tener al menos 8 caracteres.";
    }

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const signIn = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const correo = form.email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: form.password,
    });

    if (error) {
      setErrors({
        password: "Correo electrónico o contraseña incorrectos.",
      });
      return;
    }

    if (!data.user) {
      setErrors({
        email: "No se pudo iniciar sesión.",
      });
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .single();

    if (perfilError || !perfil) {
      await supabase.auth.signOut();
      setErrors({
        email: "No se pudo obtener tu perfil.",
      });
      return;
    }

    if (perfil.role !== role && perfil.role !== "admin") {
      await supabase.auth.signOut();
      setErrors({
        email: "Esta cuenta no corresponde al rol seleccionado.",
      });
      return;
    }

    setErrors({});
    notice("Inicio de sesión correcto.");
  };

  const register = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const correo = form.email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          role,
          phone: form.phone.trim(),
          institution: form.institution?.trim() || "",
          career: form.career?.trim() || "",
          skills: form.skills?.trim() || "",
        },
      },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already exists")
      ) {
        setErrors({
          email: "Este correo electrónico ya está registrado.",
        });
      } else {
        setErrors({
          email: "No se pudo completar el registro.",
        });
        console.error("Error de registro:", error.message);
      }
      return;
    }

    if (!data.user) {
      setErrors({
        email: "No se pudo crear la cuenta. Inténtalo nuevamente.",
      });
      return;
    }

    setErrors({});
    notice("Cuenta creada correctamente en Supabase.");
  };

  const submitVerification = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "estudiante") {
      notice("Solo los estudiantes pueden enviar documentos.");
      return;
    }

    const archivo = e.currentTarget.elements.document.files?.[0];

    if (!archivo) {
      notice("Selecciona un documento.");
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];

    if (!tiposPermitidos.includes(archivo.type)) {
      notice("Solo se permiten archivos JPG, PNG o PDF.");
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      notice("El documento no debe superar los 5 MB.");
      return;
    }

    const extension =
      archivo.type === "application/pdf"
        ? "pdf"
        : archivo.type === "image/png"
          ? "png"
          : "jpg";

    const identificador = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 12)}`;

    const ruta = `${user.id}/${identificador}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("student-verifications")
      .upload(ruta, archivo, {
        contentType: archivo.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir documento:", uploadError);
      notice("No se pudo subir el documento.");
      return;
    }

    const { error: insertError } = await supabase
      .from("verification_documents")
      .insert([
        {
          student_id: user.id,
          file_path: ruta,
          file_name: archivo.name,
        },
      ]);

    if (insertError) {
      console.error("Error al registrar documento:", insertError);

      await supabase.storage.from("student-verifications").remove([ruta]);

      notice("No se pudo registrar la solicitud.");
      return;
    }

    notice("Documento enviado correctamente. Pendiente de revisión.");
    go("home");
  };

  const publish = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "contratante") {
      notice("Solo los contratantes pueden publicar cachuelos.");
      return;
    }

    const nuevaOferta = {
      owner_id: user.id,
      title: String(form.title || "").trim(),
      description: String(form.description || "").trim(),
      zone: String(form.zone || "").trim(),
      work_date: form.date || null,
      work_time: String(form.time || "").trim(),
      pay: Number(form.pay),
      category: form.category || "Otros",
      phone: String(form.phone || user.phone || "").trim(),
      status: "abierto",
    };

    if (
      !nuevaOferta.title ||
      !nuevaOferta.description ||
      !nuevaOferta.zone ||
      !nuevaOferta.work_date ||
      !nuevaOferta.work_time ||
      !String(form.pay || "").trim() ||
      !Number.isFinite(nuevaOferta.pay) ||
      nuevaOferta.pay <= 0
    ) {
      notice("Completa correctamente todos los campos obligatorios.");
      return;
    }

    const { error } = await supabase.from("jobs").insert([nuevaOferta]);

    if (error) {
      console.error("Error al publicar cachuelo:", error);
      notice("No se pudo publicar el cachuelo.");
      return;
    }

    await cargarCachuelos();
    go("home");
    notice("¡Cachuelo publicado correctamente!");
  };

  const eliminarCachuelo = async () => {
    if (!user || user.role !== "contratante" || !job || job.owner !== user.id) {
      notice("No tienes permiso para eliminar este cachuelo.");
      return;
    }

    const confirmado = window.confirm(
      `¿Estás seguro de eliminar "${job.title}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmado) return;

    const { data, error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id)
      .eq("owner_id", user.id)
      .select("id");

    if (error) {
      console.error("Error al eliminar cachuelo:", error);
      notice("No se pudo eliminar el cachuelo.");
      return;
    }

    if (!data?.length) {
      notice("No se pudo eliminar la oferta. Revisa tus permisos.");
      return;
    }

    setJobs((anteriores) => anteriores.filter((j) => j.id !== job.id));

    setSelected(null);
    go("home");
    notice("Cachuelo eliminado correctamente.");
  };

  const apply = async () => {
    if (applying) return;

    if (!user || user.role !== "estudiante") {
      notice("Solo los estudiantes pueden postular.");
      return;
    }

    if (!job || job.status !== "abierto") {
      notice("Este cachuelo no está disponible.");
      return;
    }

    if (!user.verified) {
      notice("Necesitas aprobación de verificación para postular.");
      return;
    }

    if (
      applications.some((a) => a.job_id === job.id && a.student_id === user.id)
    ) {
      notice("Ya postulaste a este cachuelo.");
      return;
    }

    setApplying(true);

    const { error } = await supabase.from("applications").insert([
      {
        job_id: job.id,
        student_id: user.id,
        status: "pendiente",
      },
    ]);

    setApplying(false);

    if (error) {
      console.error("Error al postular:", error);

      if (error.code === "23505") {
        notice("Ya postulaste a este cachuelo.");
      } else {
        notice("No se pudo enviar la postulación.");
      }

      return;
    }

    await cargarPostulaciones();

    go("applications");
    notice("Postulación enviada correctamente.");
  };

  const contactarWhatsApp = (a) => {
    if (user?.role !== "contratante" || a.status !== "confirmada") {
      notice("Solo puedes contactar postulantes aceptados.");
      return;
    }

    const oferta = jobs.find((j) => j.id === a.job_id);

    if (!oferta || oferta.owner !== user.id) {
      notice("No tienes permiso para contactar a este estudiante.");
      return;
    }

    const estudiante = a.estudiante;
    const telefono = String(estudiante?.phone || "").replace(/\D/g, "");

    if (!telefono) {
      notice("El estudiante no tiene un número registrado.");
      return;
    }

    const numero = telefono.length === 9 ? `51${telefono}` : telefono;

    const mensaje = encodeURIComponent(
      `Hola ${estudiante?.full_name || ""}, soy el contratante del cachuelo "${oferta.title}". Tu postulación fue aceptada. Me gustaría coordinar los detalles del trabajo.`,
    );

    window.open(
      `https://wa.me/${numero}?text=${mensaje}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const actualizarPostulacion = async (a, nuevoEstado) => {
    if (user?.role !== "contratante") {
      notice("Solo los contratantes pueden gestionar postulaciones.");
      return;
    }

    const oferta = jobs.find((j) => j.id === a.job_id);

    if (!oferta || oferta.owner !== user.id) {
      notice("No tienes permiso para gestionar esta postulación.");
      return;
    }

    if (a.status !== "pendiente") {
      notice("Esta postulación ya fue atendida.");
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .update({ status: nuevoEstado })
      .eq("id", a.id)
      .eq("job_id", oferta.id)
      .eq("status", "pendiente")
      .select("id");

    if (error) {
      console.error("Error al actualizar postulación:", error);
      notice("No se pudo actualizar la postulación.");
      return;
    }

    if (!data?.length) {
      notice("La postulación ya cambió o no tienes permiso.");
      await cargarPostulaciones();
      return;
    }

    await cargarPostulaciones();

    notice(
      nuevoEstado === "confirmada"
        ? "Postulación aceptada correctamente."
        : "Postulación rechazada correctamente.",
    );
  };

  const approve = (u, ok) => {
    save({
      ...db,
      users: db.users.map((x) =>
        x.id === u.id
          ? {
              ...x,
              verified: ok,
              verificationStatus: ok ? "aprobada" : "rechazada",
            }
          : x,
      ),
    });
    notice("Estado de verificación actualizado (simulación)");
  };

  const revisarEstudiante = async (estudiante, accion) => {
    if (user?.role !== "admin") {
      notice("No tienes permisos para realizar esta acción.");
      return;
    }

    if (!estudiante?.id || !estudiante?.documento) {
      notice("El estudiante no tiene un documento para revisar.");
      return;
    }

    if (reviewingStudent) return;

    const nuevoEstado =
      accion === "aprobar"
        ? "aprobada"
        : accion === "rechazar"
          ? "rechazada"
          : null;

    if (!nuevoEstado) return;

    setReviewingStudent(estudiante.id);

    try {
      const { error } = await supabase.rpc("review_student_verification", {
        target_student_id: estudiante.id,
        new_status: nuevoEstado,
      });

      if (error) throw error;

      notice(
        accion === "aprobar"
          ? "Estudiante verificado correctamente."
          : "Verificación rechazada correctamente.",
      );

      await cargarVerificaciones();
    } catch (error) {
      console.error("Error al revisar estudiante:", error);
      notice(error.message || "No se pudo actualizar la verificación.");
    } finally {
      setReviewingStudent(null);
    }
  };

  const verDocumentoEstudiante = async (estudiante) => {
    if (user?.role !== "admin") {
      notice("No tienes permisos para revisar documentos.");
      return;
    }

    if (!estudiante.documento?.file_path) {
      notice("Este estudiante no tiene un documento registrado.");
      return;
    }

    // Abrir una pestaña inmediatamente para evitar bloqueos
    const ventana = window.open("", "_blank");

    if (!ventana) {
      notice("Permite las ventanas emergentes para abrir el documento.");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("student-verifications")
        .createSignedUrl(estudiante.documento.file_path, 60);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error("No se pudo generar el enlace temporal.");
      }

      ventana.location.href = data.signedUrl;
    } catch (error) {
      ventana.close();
      console.error("Error al abrir documento:", error);
      notice("No se pudo abrir el documento. Revisa los permisos de Storage.");
    }
  };

  const cargarVerificaciones = async () => {
    console.log("DEBUG: cargarVerificaciones ejecutada", {
      screen,
      role: user?.role,
      userId: user?.id,
    });

    if (user?.role !== "admin") return;

    setStudentsLoading(true);

    try {
      // Obtener estudiantes registrados
      const { data: estudiantes, error: errorEstudiantes } = await supabase
        .from("profiles")
        .select("id, full_name, role, verified, verification_status")
        .eq("role", "estudiante");

      if (errorEstudiantes) {
        throw errorEstudiantes;
      }

      // Obtener documentos enviados
      const { data: documentos, error: errorDocumentos } = await supabase
        .from("verification_documents")
        .select("id, student_id, file_name, file_path, created_at")
        .order("created_at", { ascending: false });

      if (errorDocumentos) {
        throw errorDocumentos;
      }

      // Relacionar cada estudiante con su último documento
      const resultado = (estudiantes || []).map((estudiante) => {
        const documento = (documentos || []).find(
          (doc) => doc.student_id === estudiante.id,
        );

        return {
          ...estudiante,
          documento: documento || null,
        };
      });

      setStudents(resultado);
      console.log("Verificaciones cargadas:", resultado);
    } catch (error) {
      console.error("Error al cargar verificaciones:", error);
      notice("No se pudieron cargar las verificaciones.");
    } finally {
      setStudentsLoading(false);
    }
  };
  useEffect(() => {
    if (screen === "admin" && user?.role === "admin") {
      cargarVerificaciones();
    }
  }, [screen, user?.id, user?.role]);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      notice("No se pudo cerrar sesión.");
      return;
    }

    setUser(null);
    setUid("");
    setScreen("welcome");
    setForm({});
    setErrors({});
  };

  const changeProfilePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file || !user) return;

    setPhotoError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Solo se permiten imágenes JPG, PNG o WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("La imagen no debe superar los 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const photo = reader.result;

      try {
        const updatedUsers = db.users.map((u) =>
          u.id === uid ? { ...u, photo } : u,
        );

        const updatedDb = {
          ...db,
          users: updatedUsers,
        };

        localStorage.setItem(STORE, JSON.stringify(updatedDb));
        setDb(updatedDb);
        notice("Foto de perfil actualizada.");
      } catch {
        setPhotoError("No hay espacio suficiente para guardar la imagen.");
      }

      e.target.value = "";
    };

    reader.onerror = () => {
      setPhotoError("No se pudo leer la imagen.");
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    if (!user) return;

    const updatedDb = {
      ...db,
      users: db.users.map((u) => (u.id === uid ? { ...u, photo: "" } : u)),
    };

    try {
      localStorage.setItem(STORE, JSON.stringify(updatedDb));
      setDb(updatedDb);
      setPhotoError("");
      notice("Foto de perfil eliminada.");
    } catch {
      setPhotoError("No se pudo actualizar el perfil.");
    }
  };

  const input = (
    label,
    key,
    placeholder = "",
    type = "text",
    required = true,
  ) => (
    <label className="field">
      <span>
        {label}
        {!required && " (opcional)"}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={form[key] || ""}
        onChange={(e) => field(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        className={errors[key] ? "input-error" : ""}
      />

      {errors[key] && (
        <small className="error-message" role="alert">
          <AlertCircle size={14} />
          {errors[key]}
        </small>
      )}
    </label>
  );

  const top = (title, back = "home") => (
    <div className="topline">
      <button className="plain" onClick={() => go(back)} aria-label="Volver">
        <ArrowLeft size={21} />
      </button>
      <b>{title}</b>
      <span className="topspace" />
    </div>
  );
  const brand = (
    <div className="brand">
      <img
        src="/logo-cachuelitos.png"
        alt="Logo Cachuelitos"
        className="brand-logo"
      />
      <strong>Cachuelitos</strong>
    </div>
  );
  const nav = (
    <nav className="bottom-nav">
      <button
        className={screen === "home" ? "active" : ""}
        onClick={() => go("home")}
      >
        <Home size={20} />
        Inicio
      </button>
      <button
        className={screen === "applications" ? "active" : ""}
        onClick={() => go("applications")}
      >
        <BriefcaseBusiness size={20} />
        {user?.role === "contratante" ? "Postulantes" : "Postulaciones"}
      </button>
      <button
        className={screen === "profile" ? "active" : ""}
        onClick={() => go("profile")}
      >
        <UserRound size={20} />
        Perfil
      </button>
    </nav>
  );
  const cards = (items) =>
    items.map((j) => (
      <button
        className="job-card"
        key={j.id}
        onClick={() => {
          setSelected(j.id);
          go("detail");
        }}
      >
        <div className="job-icon">
          <Store size={23} />
        </div>
        <div className="job-body">
          <b>{j.title}</b>
          <small>{j.ownerName || "Contratante"}</small>
          <span>
            <MapPin size={12} />
            {j.zone}
          </span>
          <strong>S/ {j.pay.toFixed(2)}</strong>
        </div>
        <ChevronRight size={19} className="chevron" />
      </button>
    ));
  const misOfertas = jobs.filter(
    (j) => user?.role === "contratante" && j.owner === user.id,
  );
  const allJobs = jobs.filter((j) => j.status === "abierto");
  const filtered = allJobs.filter(
    (j) =>
      (cat === "Todos" || j.category === cat) &&
      `${j.title} ${j.zone} ${j.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const apps = applications.filter((a) => {
    if (user?.role === "admin") return true;

    if (user?.role === "contratante") {
      return jobs.some((j) => j.id === a.job_id && j.owner === user.id);
    }

    return a.student_id === user?.id;
  });

  if (authLoading) {
    return (
      <div className="phone-shell">
        <div className="phone-screen">
          <div className="page">
            <p style={{ textAlign: "center", marginTop: 100 }}>
              Cargando Cachuelitos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-shell">
      <div className="phone-screen">
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
        {screen === "welcome" && (
          <section className="welcome">
            <div className="welcome-logo">
              <img
                src="/logo-cachuelitos.png"
                alt="Logo oficial Cachuelitos"
                className="welcome-logo-img"
              />
            </div>
            <h1>Cachuelitos</h1>
            <p>
              Trabajos temporales para estudiantes
              <br />
            </p>
            <div className="welcome-actions">
              <button
                className="btn"
                onClick={() => {
                  setMode("login");
                  go("auth");
                }}
              >
                Iniciar sesión
              </button>
              <button
                className="btn outline"
                onClick={() => {
                  setMode("register");
                  go("auth");
                }}
              >
                Crear cuenta
              </button>
            </div>
          </section>
        )}
        {screen === "auth" && (
          <>
            <div className="auth-brand">
              {brand}
              <small>Trabajos temporales para estudiantes en Ayacucho</small>
            </div>
            <div className="segmented">
              <button
                className={role === "estudiante" ? "on" : ""}
                onClick={() => setRole("estudiante")}
              >
                <GraduationCap size={16} /> Estudiante
              </button>
              <button
                className={role === "contratante" ? "on" : ""}
                onClick={() => setRole("contratante")}
              >
                Contratante
              </button>
            </div>
            <form
              className="form"
              onSubmit={mode === "login" ? signIn : register}
              noValidate
            >
              {mode === "register" && (
                <>
                  {input("Nombres y Apellidos", "name")}

                  {role === "estudiante" && (
                    <>
                      {input("Universidad / Instituto", "institution")}
                      {input("Carrera profesional", "career")}
                      {input("Habilidades", "skills", "", "text", false)}
                    </>
                  )}

                  {input("Número de celular", "phone", "", "tel")}
                </>
              )}

              {input("Correo electrónico", "email", "", "email")}

              <label className="field">
                <span>Contraseña</span>
                <div className="password">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password || ""}
                    onChange={(e) => field("password", e.target.value)}
                    aria-invalid={Boolean(errors.password)}
                    className={errors.password ? "input-error" : ""}
                    required
                  />
                  <button
                    type="button"
                    className="plain"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <small className="error-message" role="alert">
                    <AlertCircle size={14} />
                    {errors.password}
                  </small>
                )}
              </label>
              <button className="btn submit">
                {mode === "login" ? "Iniciar sesión" : "Registrarme"}
              </button>
              <p className="switchmode">
                {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setForm({});
                    setErrors({});
                  }}
                >
                  {mode === "login" ? "Regístrate aquí" : "Inicia sesión"}
                </button>
              </p>
            </form>
          </>
        )}
        {screen === "verify" && (
          <>
            {top("Verificación de Carné Universitario", "home")}
            <div className="page">
              <h2 className="center">
                Verificación de Carné
                <br />
                Universitario
              </h2>
              <form onSubmit={submitVerification}>
                <div className="upload-area">
                  <Upload size={35} />
                  <b>Verificación de Carné Universitario</b>
                  <p>
                    Sube una foto clara de tu carné universitario o constancia
                    vigente.
                  </p>
                  <input
                    name="document"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    required
                  />
                  <small>JPG, PNG o PDF (máx. 5 MB)</small>
                </div>
                <p className="helper">
                  Tu documento será almacenado de forma privada y revisado por
                  el administrador de Cachuelitos.
                </p>
                <button className="btn">Enviar y Validar Registro</button>
              </form>
            </div>
          </>
        )}
        {screen === "home" && (
          <>
            <header className="app-header">
              <button className="plain" onClick={() => go("profile")}>
                <Menu size={20} />
              </button>
              {brand}
              <button
                className="plain"
                onClick={() => notice("Sin notificaciones nuevas")}
              >
                <Bell size={19} />
              </button>
            </header>
            <div className="page home-page">
              <h2>¡Hola, {user?.name?.split(" ")[0] || "bienvenido"}!</h2>
              {user?.role === "estudiante" && (
                <div
                  className={"verified " + (user.verified ? "ok" : "pending")}
                >
                  <CheckCircle2 size={14} />
                  {user.verified
                    ? "Estudiante verificado"
                    : "Verificación pendiente"}
                </div>
              )}
              {user?.role === "contratante" && (
                <p className="subheading">
                  Publica oportunidades para estudiantes
                </p>
              )}
              {user?.role === "admin" && (
                <button className="admin-link" onClick={() => go("admin")}>
                  Abrir panel de administrador <ChevronRight size={17} />
                </button>
              )}
              <label className="searchbar">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cachuelos..."
                />
              </label>
              {jobsLoading && <p className="helper">Cargando cachuelos...</p>}
              <div className="categories">
                {categories.map(([name, Icon]) => (
                  <button
                    key={name}
                    className={cat === name ? "active" : ""}
                    onClick={() => setCat(name)}
                  >
                    <Icon size={20} />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
              <div className="section-head">
                <h3>Cachuelos disponibles</h3>
                <span>{filtered.length} ofertas</span>
              </div>
              {cards(filtered)}
              {!filtered.length && (
                <p className="empty">No hay cachuelos para esta búsqueda.</p>
              )}
              {user?.role === "contratante" && (
                <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                  <button className="btn" onClick={() => go("my-jobs")}>
                    <ClipboardList size={18} />
                    Mis ofertas publicadas
                  </button>

                  <button className="btn outline" onClick={() => go("publish")}>
                    <Plus size={18} />
                    Publicar nuevo cachuelo
                  </button>
                </div>
              )}
              {user?.role === "estudiante" && !user.verified && (
                <button
                  className="btn outline sticky-action"
                  onClick={() => go("verify")}
                >
                  Enviar verificación
                </button>
              )}
            </div>
            {nav}
          </>
        )}
        {screen === "detail" && (
          <>
            {top("Detalle del cachuelo")}
            <div className="page detail-page">
              {job ? (
                <>
                  <div className="detail-title">
                    <div className="job-icon">
                      <Store size={25} />
                    </div>
                    <div>
                      <h2>{job.title}</h2>
                      <p>
                        {db.users.find((u) => u.id === job.owner)?.name ||
                          "Contratante"}
                      </p>
                    </div>
                  </div>
                  <div className="detail-facts">
                    <p>
                      <MapPin size={17} />
                      {job.zone}
                    </p>
                    <p>
                      <CalendarDays size={17} />
                      {job.date}
                    </p>
                    <p>
                      <Clock3 size={17} />
                      {job.time}
                    </p>
                    <p>
                      <Wallet size={17} />
                      <b>S/ {job.pay.toFixed(2)}</b>
                    </p>
                  </div>
                  <h3>Descripción</h3>
                  <p>{job.description}</p>
                  <div className="bottom-cta">
                    {user?.role === "estudiante" ? (
                      <button
                        className="btn"
                        onClick={apply}
                        disabled={
                          applying ||
                          job.status !== "abierto" ||
                          applications.some(
                            (a) =>
                              a.job_id === job.id && a.student_id === user?.id,
                          )
                        }
                      >
                        {applying
                          ? "Enviando..."
                          : applications.some(
                                (a) =>
                                  a.job_id === job.id &&
                                  a.student_id === user?.id,
                              )
                            ? "Ya postulaste"
                            : "Postularme"}
                      </button>
                    ) : (
                      <div style={{ display: "grid", gap: 10, width: "100%" }}>
                        {user?.role === "contratante" &&
                          job.owner === user.id && (
                            <button
                              type="button"
                              className="btn"
                              onClick={eliminarCachuelo}
                              style={{ background: "#b42318", color: "#fff" }}
                            >
                              Eliminar cachuelo
                            </button>
                          )}

                        <button
                          type="button"
                          className="btn outline"
                          onClick={() => go("home")}
                        >
                          Volver a las ofertas
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p>Oferta no encontrada.</p>
              )}
            </div>
          </>
        )}

        {screen === "my-jobs" && user?.role === "contratante" && (
          <>
            {top("Mis ofertas publicadas")}

            <div className="page">
              <h2>Mis cachuelos</h2>

              <p className="helper">
                Administra tus ofertas y revisa sus postulantes.
              </p>

              {misOfertas.map((j) => {
                const postulantes = applications.filter(
                  (a) => a.job_id === j.id,
                );

                return (
                  <article className="application-card" key={j.id}>
                    <div className="application-body">
                      <b>{j.title}</b>

                      <small>
                        <MapPin size={13} />
                        {j.zone}
                      </small>

                      <small>
                        <Wallet size={13} />
                        S/ {j.pay.toFixed(2)}
                      </small>

                      <span className="status">
                        {j.status === "abierto"
                          ? "Abierto"
                          : "Asignado / Cerrado"}
                      </span>

                      <p>
                        Postulantes: <b>{postulantes.length}</b>
                      </p>

                      <button
                        type="button"
                        className="btn mini"
                        onClick={() => {
                          setSelected(j.id);
                          go("detail");
                        }}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </article>
                );
              })}

              {!misOfertas.length && (
                <p className="empty">
                  Todavía no has publicado ningún cachuelo.
                </p>
              )}

              <button className="btn" onClick={() => go("publish")}>
                <Plus size={18} />
                Publicar nuevo cachuelo
              </button>
            </div>

            {nav}
          </>
        )}

        {screen === "publish" && (
          <>
            {top("Publicar Cachuelo")}
            <form className="form page publish" onSubmit={publish}>
              {input("Título del cachuelo", "title")}
              <label className="field">
                <span>Descripción del trabajo</span>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => field("description", e.target.value)}
                  placeholder="Describe la tarea que necesitas realizar"
                  required
                  maxLength={500}
                />
              </label>
              <label className="field">
                <span>Categoría</span>
                <select
                  value={form.category || "Otros"}
                  onChange={(e) => field("category", e.target.value)}
                >
                  <option>Otros</option>
                  <option>Ventas</option>
                  <option>Eventos</option>
                </select>
              </label>
              {input("Zona en Ayacucho", "zone")}
              <div className="two-fields">
                {input("Fecha", "date", "", "date")}
                {input("Horario", "time")}
              </div>

              {input("Pago en soles (S/)", "pay", "", "number")}
              {input("Número de WhatsApp", "phone", "", "tel", false)}

              <button className="btn submit">Publicar oferta</button>
            </form>
          </>
        )}
        {screen === "applications" && (
          <>
            {top(
              user?.role === "contratante"
                ? "Gestión de postulantes"
                : "Mis postulaciones",
            )}
            <div className="page applications">
              <div className="segmented">
                <button
                  className={!history ? "on" : ""}
                  onClick={() => setHistory(false)}
                >
                  En proceso
                </button>
                <button
                  className={history ? "on" : ""}
                  onClick={() => setHistory(true)}
                >
                  Historial
                </button>
              </div>

              {applicationsLoading && (
                <p className="helper">Cargando postulaciones...</p>
              )}

              {apps
                .filter((a) =>
                  history ? a.status !== "pendiente" : a.status === "pendiente",
                )
                .map((a) => {
                  const j = jobs.find((x) => x.id === a.job_id);

                  return (
                    <article className="application-card" key={a.id}>
                      <div className="job-icon">
                        <Store size={20} />
                      </div>

                      <div className="application-body">
                        <b>{j?.title || "Oferta"}</b>

                        <small>
                          {user?.role === "contratante"
                            ? `Estudiante: ${a.estudiante?.full_name || "Nombre no disponible"}`
                            : `Contratante: ${j?.ownerName || "Contratante"}`}
                        </small>

                        <span
                          className={
                            "status " +
                            (a.status === "confirmada" ? "done" : "")
                          }
                        >
                          {a.status === "confirmada"
                            ? "✓ Aceptada"
                            : a.status === "rechazada"
                              ? "✕ Rechazada"
                              : "◷ Pendiente"}
                        </span>
                        {user?.role === "contratante" &&
                          a.status === "confirmada" && (
                            <button
                              type="button"
                              className="btn mini"
                              style={{ marginTop: 10 }}
                              onClick={() => contactarWhatsApp(a)}
                            >
                              <MessageCircle size={16} />
                              Contactar por WhatsApp
                            </button>
                          )}

                        {user?.role === "contratante" &&
                          a.status === "pendiente" && (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                marginTop: 10,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                className="btn mini"
                                onClick={() =>
                                  actualizarPostulacion(a, "confirmada")
                                }
                              >
                                <Check size={15} />
                                Aceptar
                              </button>

                              <button
                                type="button"
                                className="btn mini"
                                style={{
                                  background: "#b42318",
                                  color: "#fff",
                                }}
                                onClick={() =>
                                  actualizarPostulacion(a, "rechazada")
                                }
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                      </div>
                    </article>
                  );
                })}

              {!applicationsLoading &&
                !apps.filter((a) =>
                  history ? a.status !== "pendiente" : a.status === "pendiente",
                ).length && (
                  <p className="empty">Todavía no hay postulaciones aquí.</p>
                )}

              {user?.role === "estudiante" && (
                <div className="info-box">
                  Para coordinar el trabajo y confirmar el acuerdo, el
                  contratante se comunicará contigo por WhatsApp.
                </div>
              )}
            </div>
            {nav}
          </>
        )}
        {screen === "profile" && (
          <>
            {top("Mi perfil")}
            <div className="page profile">
              <div className="profile-photo-section">
                <div className="profile-avatar">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt="Foto de perfil"
                      className="profile-photo"
                    />
                  ) : (
                    <span className="profile-initials">
                      {user?.name
                        ?.trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join("") || <UserRound size={36} />}
                    </span>
                  )}
                </div>

                <div className="profile-photo-actions">
                  <label className="photo-upload-button">
                    <Upload size={16} />
                    {user?.photo ? "Cambiar foto" : "Subir foto"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={changeProfilePhoto}
                      hidden
                    />
                  </label>

                  {user?.photo && (
                    <button
                      type="button"
                      className="photo-remove-button"
                      onClick={removeProfilePhoto}
                    >
                      Eliminar foto
                    </button>
                  )}
                </div>

                {photoError && (
                  <p className="photo-error" role="alert">
                    <AlertCircle size={15} />
                    {photoError}
                  </p>
                )}
              </div>
              <h2>{user?.name || "Visitante"}</h2>
              <p>{user?.email || "Sin sesión"}</p>
              <div className="profile-list">
                <div>
                  <b>Tipo de cuenta</b>
                  <span>{user?.role || "Invitado"}</span>
                </div>
                {user?.role === "estudiante" && (
                  <>
                    <div>
                      <b>Universidad / Instituto</b>
                      <span>{user.institution || "Sin registrar"}</span>
                    </div>
                    <div>
                      <b>Verificación</b>
                      <span>{user.verificationStatus || "Sin enviar"}</span>
                    </div>
                    <button onClick={() => go("verify")}>
                      <ShieldCheck size={19} /> Enviar / revisar verificación{" "}
                      <ChevronRight size={17} />
                    </button>
                  </>
                )}
                {user?.role === "contratante" && (
                  <button onClick={() => go("publish")}>
                    <Plus size={19} /> Publicar nuevo cachuelo{" "}
                    <ChevronRight size={17} />
                  </button>
                )}
                {user?.role === "admin" && (
                  <button onClick={() => go("admin")}>
                    <Users size={19} /> Panel de administración{" "}
                    <ChevronRight size={17} />
                  </button>
                )}
              </div>
              <button className="btn outline" onClick={logout}>
                <LogOut size={17} /> Cerrar sesión
              </button>
            </div>
            {nav}
          </>
        )}

        {screen === "admin" && (
          <>
            {top("Panel de administrador", "home")}

            <div className="page admin-page">
              <h2>Panel de administrador</h2>

              <div className="admin-stat">
                <Users size={23} />
                <b>Estudiantes pendientes</b>
                <span>
                  {
                    students.filter(
                      (u) => u.verification_status === "pendiente",
                    ).length
                  }
                </span>
              </div>

              <div className="admin-stat">
                <BriefcaseBusiness size={23} />
                <b>Cachuelos publicados</b>
                <span>{jobs.length}</span>
              </div>

              <div className="admin-stat">
                <FileText size={23} />
                <b>Postulaciones totales</b>
                <span>{applications.length}</span>
              </div>

              <h3>Revisión de estudiantes</h3>

              {studentsLoading && (
                <p className="helper">Cargando estudiantes...</p>
              )}

              {!studentsLoading && students.length === 0 && (
                <p className="empty">No hay estudiantes registrados.</p>
              )}

              {students.map((u) => (
                <div className="review-card" key={u.id}>
                  <b>{u.full_name || "Estudiante sin nombre"}</b>

                  <small>Estado: {u.verification_status || "sin_enviar"}</small>

                  <p>
                    Archivo declarado: {u.documento?.file_name || "Sin archivo"}
                  </p>

                  {u.documento ? (
                    <small>Documento registrado en Supabase.</small>
                  ) : (
                    <small>
                      El estudiante todavía no ha enviado un documento.
                    </small>
                  )}

                  <div className="review-actions">
                    <button
                      type="button"
                      disabled={!u.documento || reviewingStudent === u.id}
                      onClick={() => verDocumentoEstudiante(u)}
                    >
                      Ver documento
                    </button>

                    {u.verification_status === "pendiente" && u.documento && (
                      <>
                        <button
                          type="button"
                          disabled={reviewingStudent === u.id}
                          onClick={() => revisarEstudiante(u, "aprobar")}
                        >
                          Aprobar
                        </button>

                        <button
                          type="button"
                          disabled={reviewingStudent === u.id}
                          onClick={() => revisarEstudiante(u, "rechazar")}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
