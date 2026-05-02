import { useEffect } from "react";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  Download,
  Eye,
  FileText,
  GraduationCap,
  LayoutGrid,
  Plus,
  Search,
  Share2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function App() {
  return (
    <div>
      <div
        className="bg-white text-neutral-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible"
        style={{
          backgroundColor: "#F8F9FA",
          fontFamily: "Inter, Geist, sans-serif",
        }}
        data-id="64a7505a-db7b-5105-8342-53c1fec320f9"
      >
        <div
          className="flex w-285 h-239"
          data-id="56afc8d3-b5fe-5da3-b02c-ee653ce4c749"
        >
          <aside
            className="flex p-6 flex-col items-center gap-8 w-55 h-full"
            style={{
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              backdropFilter: "blur(20px) saturate(180%)",
              backgroundColor: "rgba(255,255,255,0.6)",
              borderRight: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "4px 0 30px rgba(139,127,180,0.08)",
            }}
            data-id="eb47dcc1-c7d8-5dc2-9e36-5a35dc0ae20d"
          >
            <div
              className="flex items-center gap-2 w-full"
              data-id="8381c01e-40bd-5f88-99db-7be6bf00b4dc"
            >
              <div
                className="size-9 transition-all duration-300 rounded-xl flex justify-center items-center"
                style={{
                  background:
                    "linear-gradient(135deg, #A8D5BA 0%, #B8A4E3 50%, #FFB5A0 100%)",
                  boxShadow: "0 8px 24px rgba(184,164,227,0.35)",
                }}
                data-id="eb94d391-a6b7-5999-880d-963f7de5a68d"
              >
                <GraduationCap
                  className="size-5 text-white"
                  data-id="86d0e8b8-502b-5339-844b-d9f3521054cb"
                />
              </div>
              <span
                className="font-extrabold text-lg leading-7 tracking-tight"
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  background:
                    "linear-gradient(135deg, #6B7B8C 0%, #B8A4E3 100%)",
                  backgroundClip: "text",
                }}
                data-id="8a11e799-4996-5304-a1bb-3c24f00f64ec"
              >
                SKAKK-UP
              </span>
            </div>
            <nav
              className="flex flex-col gap-2 w-full"
              data-id="b53e83f6-a1fc-594f-aa2a-1f6897d9c489"
            >
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{ color: "#6B7280" }}
                data-id="f0c5e347-77a1-5ef6-af54-e21df2e2c3ec"
              >
                <LayoutGrid
                  className="size-4"
                  data-id="1e5610cf-f4fe-510a-84e5-e8d6f663c979"
                />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{
                  backgroundColor: "rgba(168,213,186,0.18)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 4px 16px rgba(168,213,186,0.25)",
                  color: "#2D3748",
                }}
                data-id="913f56d2-d3bd-5910-9cac-5f8ca2c4f073"
              >
                <BookOpen
                  className="size-4"
                  style={{ color: "#7AB89A" }}
                  data-id="3d203388-8781-596f-b00c-ddc3463cc197"
                />
                Materie
              </Button>
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{ color: "#6B7280" }}
                data-id="2d60781d-60e3-5bec-a30f-023a8b5c3f66"
              >
                <FileText
                  className="size-4"
                  data-id="41903eeb-7d93-5351-88cc-9fd453b6fb26"
                />
                Appunti
              </Button>
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{ color: "#6B7280" }}
                data-id="f7b72137-ef45-50cb-9ff9-623f0140a8db"
              >
                <Share2
                  className="size-4"
                  data-id="0b390b5e-653b-5d24-aa1b-c976f8535b69"
                />
                Condivisi
              </Button>
            </nav>
          </aside>
          <div
            className="flex flex-col flex-1"
            data-id="e0a8540e-8cb0-5f85-bfb4-88d268a51218"
          >
            <header
              className="flex px-8 justify-between items-center h-16"
              style={{
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                backdropFilter: "blur(20px) saturate(180%)",
                backgroundColor: "rgba(255,255,255,0.55)",
                borderBottom: "1px solid rgba(255,255,255,0.9)",
              }}
              data-id="fba8e747-09df-5991-aba8-31cc2ab9aaeb"
            >
              <div
                className="flex items-center gap-2"
                data-id="23a6a342-5cb5-5514-bd20-0ae7b6549652"
              >
                <Compass
                  className="size-5"
                  style={{ color: "#B8A4E3" }}
                  data-id="3a54f672-6f94-52bb-a2cd-890241cccbca"
                />
                <span
                  className="font-medium text-sm leading-5"
                  style={{ color: "#9CA3AF" }}
                  data-id="cabb9f89-4f91-58f7-a7a6-7d536f514f46"
                >
                  Esplora
                </span>
                <ChevronRight
                  className="size-4"
                  style={{ color: "#9CA3AF" }}
                  data-id="4dea00cf-c92d-5aa0-ab6a-1cea65b3c3ec"
                />
                <span
                  className="font-medium text-sm leading-5"
                  style={{ color: "#9CA3AF" }}
                  data-id="d57c3302-2e19-5c55-accc-e4654bdf7863"
                >
                  Materie
                </span>
                <ChevronRight
                  className="size-4"
                  style={{ color: "#9CA3AF" }}
                  data-id="db167ce4-313a-5ec4-b7f0-54d27ab457d8"
                />
                <span
                  className="font-semibold text-sm leading-5"
                  style={{ color: "#2D3748" }}
                  data-id="5884f20b-3ca4-535a-b813-3fdf19a55631"
                >
                  Matematica
                </span>
              </div>
              <div
                className="relative w-120"
                data-id="98b7cab7-a756-5ef1-a915-71146da82d5c"
              >
                <Search
                  className="top-1/2 -translate-y-1/2 size-4 absolute left-3"
                  style={{ color: "#B8A4E3" }}
                  data-id="84c46cfe-f646-52af-977b-3e5d34094302"
                />
                <Input
                  placeholder="Cerca argomento, autore, file…"
                  className="text-sm leading-5 pl-9 h-10"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 20px rgba(139,127,180,0.10)",
                    color: "#2D3748",
                  }}
                  data-id="251809bd-e6c8-5fdd-a895-98bc6852835c"
                />
              </div>
              <div data-id="942f4a57-7701-5f1c-a7a7-1950f260daf4" />
            </header>
            <main
              className="p-12 flex-1 overflow-hidden"
              data-id="c6c2288e-6c9d-5537-b495-bdfc85fd1262"
            >
              <div
                className="flex mb-6 items-center gap-6"
                data-id="0985c5e3-05c8-5ff2-ac0b-7faa7d934bec"
              >
                <div
                  className="size-16 font-bold rounded-2xl text-white text-3xl leading-9 flex justify-center items-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #A8D5BA 0%, #7AB89A 100%)",
                    boxShadow: "0 12px 28px rgba(168,213,186,0.45)",
                  }}
                  data-id="301f37e5-1fef-5d13-bb6e-949649e987a3"
                >
                  ∑
                </div>
                <div
                  className="flex-1"
                  data-id="b67a1a0e-5ce2-5164-b5ef-3c220fe0095d"
                >
                  <h1
                    className="leading-tight font-extrabold text-[40px] tracking-tight"
                    style={{ color: "#2D3748" }}
                    data-id="f4cc1257-4283-535f-aaae-32dee37d1445"
                  >
                    Matematica
                  </h1>
                  <p
                    className="text-base leading-6 mt-1"
                    style={{ color: "#9CA3AF" }}
                    data-id="adcc9cad-53bd-5b92-b0a0-9cfa08badbd6"
                  >
                    87 documenti disponibili
                  </p>
                </div>
                <div
                  className="flex items-center gap-2"
                  data-id="ae1f0259-712c-5fce-ab9e-9c94c2d39994"
                >
                  <div
                    className="font-medium rounded-full text-xs leading-4 flex px-3 items-center gap-1.5 h-8"
                    style={{
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.95)",
                      color: "#6B7280",
                      boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    }}
                    data-id="1f591a71-f3ba-5ab9-8fb8-80205dee7660"
                  >
                    <Clock
                      className="size-3.5"
                      style={{ color: "#7AB89A" }}
                      data-id="3723f0a3-02b0-5948-a82b-f7499728e9d7"
                    />
                    Aggiornato di recente
                  </div>
                  <div
                    className="font-medium rounded-full text-xs leading-4 flex px-3 items-center gap-1.5 h-8"
                    style={{
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.95)",
                      color: "#6B7280",
                      boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    }}
                    data-id="a64bb2df-23ef-5f14-9b8c-ed64f17220bd"
                  >
                    <Users
                      className="size-3.5"
                      style={{ color: "#B8A4E3" }}
                      data-id="b73044b7-d194-5960-8d4f-9e2b667a6178"
                    />
                    12 autori
                  </div>
                </div>
              </div>
              <div
                className="flex mb-8 items-center gap-2"
                data-id="2feba9a4-9f54-5c8f-9b58-3e3722d4c43c"
              >
                <Button
                  className="transition-all duration-300 ease-out font-medium rounded-full text-white text-sm leading-5 px-4 h-9"
                  style={{
                    background:
                      "linear-gradient(135deg, #B8A4E3 0%, #A8D5BA 100%)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 8px 24px rgba(184,164,227,0.35)",
                  }}
                  data-id="828db7da-65f2-52d1-a81c-cce53f26e73d"
                >
                  Tutti
                </Button>
                <Button
                  variant="outline"
                  className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    color: "#6B7280",
                  }}
                  data-id="df958659-493c-577f-b33f-7e9cea313b30"
                >
                  Algebra
                </Button>
                <Button
                  variant="outline"
                  className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    color: "#6B7280",
                  }}
                  data-id="531d3f1e-b2c2-5b14-9bec-34dc8e87a93b"
                >
                  Analisi
                </Button>
                <Button
                  variant="outline"
                  className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    color: "#6B7280",
                  }}
                  data-id="71b76e01-f36f-5538-b49c-f2011930289b"
                >
                  Geometria
                </Button>
                <Button
                  variant="outline"
                  className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    color: "#6B7280",
                  }}
                  data-id="0e874ccc-bed4-5503-8935-5e53452593d3"
                >
                  Probabilità
                </Button>
                <Button
                  variant="outline"
                  className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    color: "#6B7280",
                  }}
                  data-id="f47800ba-f02c-5524-a884-fcd7134a97a1"
                >
                  Trigonometria
                </Button>
              </div>
              <div
                className="grid grid-cols-3 gap-6"
                data-id="8d15d0d8-507e-5143-94fe-7a45ade7b810"
              >
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-3 overflow-hidden"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    height: "200px",
                  }}
                  data-id="45c324e2-0510-59d6-8bd0-ab654fd04b68"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="76ba0e92-039c-56f0-8e21-adf5c00d46e2"
                  />
                  <div
                    className="flex justify-between items-start"
                    data-id="7812f819-c411-517a-97cc-fcb9ee35e769"
                  >
                    <div
                      className="size-10 rounded-xl text-white flex justify-center items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #A8D5BA 0%, #7AB89A 100%)",
                        boxShadow: "0 6px 16px rgba(168,213,186,0.4)",
                      }}
                      data-id="d04f9d7c-50b7-5053-8dd4-8021c6c88a48"
                    >
                      <FileText
                        className="size-5"
                        data-id="8569291f-b324-57a7-9bad-88b5d972e5f0"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="size-9 rounded-full p-0"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.9)",
                      }}
                      data-id="17677898-2ded-5145-95e7-8d0732a72e68"
                    >
                      <Download
                        className="size-4"
                        style={{ color: "#7AB89A" }}
                        data-id="2730f916-496a-5f26-8793-b610681b0d66"
                      />
                    </Button>
                  </div>
                  <div
                    className="flex mt-auto flex-col gap-1"
                    data-id="dc842902-fe6c-5087-a9b5-9edb22376cd3"
                  >
                    <h3
                      className="leading-tight font-semibold text-base leading-6"
                      style={{ color: "#2D3748" }}
                      data-id="4be02c39-e293-5e51-92ac-c161ca48522c"
                    >
                      Limiti e Continuità — Teoria Completa
                    </h3>
                    <p
                      className="leading-snug text-xs leading-4"
                      style={{ color: "#9CA3AF" }}
                      data-id="234ff09a-40ab-5667-8ba7-2088964ef54b"
                    >
                      Definizioni, teoremi e esempi svolti sui limiti.
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-id="2907e7dd-fed8-5fd7-a8c2-69f6c95ba4b1"
                  >
                    <span
                      className="font-bold rounded-full text-white text-[10px] px-2 py-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                      }}
                      data-id="33ce532e-a717-5e98-a709-196208b082f5"
                    >
                      PDF
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="5a0066e3-703e-59d9-a5dd-e7520f525b2c"
                    >
                      · 24 pagine
                    </span>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-3 overflow-hidden"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    height: "200px",
                  }}
                  data-id="bde43f64-3471-5415-b470-c0fa0c80b450"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="0322f9fb-449d-558e-88d0-3df950e47f0f"
                  />
                  <div
                    className="flex justify-between items-start"
                    data-id="55204413-8227-5761-9003-ac5ac9801113"
                  >
                    <div
                      className="size-10 rounded-xl text-white flex justify-center items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #B8A4E3 0%, #9580D4 100%)",
                        boxShadow: "0 6px 16px rgba(184,164,227,0.4)",
                      }}
                      data-id="3453ad8f-b767-5f64-b6c8-c0bb359e83b2"
                    >
                      <FileText
                        className="size-5"
                        data-id="cf8139c2-7427-57f4-b87f-60a9ce5ac976"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="size-9 rounded-full p-0"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.9)",
                      }}
                      data-id="f8636410-21bb-5b2f-ad4e-35a3bb6a3364"
                    >
                      <Eye
                        className="size-4"
                        style={{ color: "#9580D4" }}
                        data-id="ee1f3473-cbce-5261-a1b0-448862fc9c1d"
                      />
                    </Button>
                  </div>
                  <div
                    className="flex mt-auto flex-col gap-1"
                    data-id="76f45163-1598-57a7-8ca9-968ce7bc32f7"
                  >
                    <h3
                      className="leading-tight font-semibold text-base leading-6"
                      style={{ color: "#2D3748" }}
                      data-id="6092ef41-0ec2-5c6c-92fd-e1bf0e5d9f96"
                    >
                      Derivate e Applicazioni
                    </h3>
                    <p
                      className="leading-snug text-xs leading-4"
                      style={{ color: "#9CA3AF" }}
                      data-id="357a40ac-5515-5fbf-8527-c08c336a8e54"
                    >
                      Regole di derivazione, massimi e minimi.
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-id="d023d4c3-4e7a-585c-b86d-fd0177574570"
                  >
                    <span
                      className="font-bold rounded-full text-white text-[10px] px-2 py-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                      }}
                      data-id="70ce6bde-67eb-598f-9780-59fe8a82fa3a"
                    >
                      PDF
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="dc8d94f4-8245-5429-b601-edb46a83f5ba"
                    >
                      · 18 pagine
                    </span>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-3 overflow-hidden"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    height: "200px",
                  }}
                  data-id="0588d204-7001-5617-b925-c556be5631a2"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="7e76703c-e4e0-5727-902e-a8293512c1d9"
                  />
                  <div
                    className="flex justify-between items-start"
                    data-id="bba320f6-e899-56a3-8251-22daaa96224d"
                  >
                    <div
                      className="size-10 rounded-xl text-white flex justify-center items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                        boxShadow: "0 6px 16px rgba(255,181,160,0.45)",
                      }}
                      data-id="6f4c7272-478a-5ff9-b1e4-15978988ea17"
                    >
                      <FileText
                        className="size-5"
                        data-id="a5526707-5e69-56f3-ba84-a992d82e3a74"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="size-9 rounded-full p-0"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.9)",
                      }}
                      data-id="051edc6f-ea9b-5c89-90b2-c73106c43fe6"
                    >
                      <Download
                        className="size-4"
                        style={{ color: "#FF9478" }}
                        data-id="c76600a9-3214-58b0-957f-3fbd10c3f43e"
                      />
                    </Button>
                  </div>
                  <div
                    className="flex mt-auto flex-col gap-1"
                    data-id="acea36d5-bfc5-52e8-8a8d-47748cf257a5"
                  >
                    <h3
                      className="leading-tight font-semibold text-base leading-6"
                      style={{ color: "#2D3748" }}
                      data-id="1a868393-f8c4-55ff-86c0-d3d2932c8147"
                    >
                      Integrali Definiti
                    </h3>
                    <p
                      className="leading-snug text-xs leading-4"
                      style={{ color: "#9CA3AF" }}
                      data-id="6a032f8d-520a-5f26-ba69-64ebb564f9e8"
                    >
                      Calcolo integrale e teorema fondamentale.
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-id="d6615398-e7b0-5e8c-86e5-a55e37df1baa"
                  >
                    <span
                      className="font-bold rounded-full text-white text-[10px] px-2 py-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                      }}
                      data-id="595cdf14-0d56-56b1-bf52-f0de6fd5ab60"
                    >
                      PDF
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="da5e7821-0a27-5066-a292-c13dace4fc80"
                    >
                      · 22 pagine
                    </span>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-3 overflow-hidden"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    height: "200px",
                  }}
                  data-id="d8dbb821-1228-59a4-8ae8-71f36523c550"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="5cd246c4-4d7a-5bff-82bc-ecd2bd4defe7"
                  />
                  <div
                    className="flex justify-between items-start"
                    data-id="32a91977-1c07-5743-ab55-5c1b25912785"
                  >
                    <div
                      className="size-10 rounded-xl text-white flex justify-center items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #A8D5BA 0%, #7AB89A 100%)",
                        boxShadow: "0 6px 16px rgba(168,213,186,0.4)",
                      }}
                      data-id="93873ece-7fa4-5ce1-96ff-619d047d450f"
                    >
                      <FileText
                        className="size-5"
                        data-id="67b06527-07a3-5145-bf0c-703cd4830259"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="size-9 rounded-full p-0"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.9)",
                      }}
                      data-id="0e0f6b64-fcb5-5a1f-841d-3bf42139a5ba"
                    >
                      <Eye
                        className="size-4"
                        style={{ color: "#7AB89A" }}
                        data-id="0e2d75b1-c700-593a-a8e9-2f1d7f687e32"
                      />
                    </Button>
                  </div>
                  <div
                    className="flex mt-auto flex-col gap-1"
                    data-id="e174d7d5-8057-5691-a375-d0b5f8a88d02"
                  >
                    <h3
                      className="leading-tight font-semibold text-base leading-6"
                      style={{ color: "#2D3748" }}
                      data-id="68e271a3-cfc6-5e51-9cf2-d17dd0c39ba3"
                    >
                      Equazioni Differenziali
                    </h3>
                    <p
                      className="leading-snug text-xs leading-4"
                      style={{ color: "#9CA3AF" }}
                      data-id="af8bf7c8-a50f-500a-88eb-800035c78854"
                    >
                      Metodi risolutivi per ED del primo ordine.
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-id="852b6168-4e1a-5a73-950f-352877af03ab"
                  >
                    <span
                      className="font-bold rounded-full text-white text-[10px] px-2 py-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                      }}
                      data-id="5c5aaa2e-4b42-5f9a-9955-fdb41a1e7c79"
                    >
                      PDF
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="742232a0-2035-548e-b69e-578c09d60731"
                    >
                      · 16 pagine
                    </span>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-3 overflow-hidden"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    height: "200px",
                  }}
                  data-id="ad273945-5e3c-5d6e-ae1d-ecad7fcac0c7"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="debb2c33-e7f9-51f7-9bbb-afe1243040ad"
                  />
                  <div
                    className="flex justify-between items-start"
                    data-id="3c8fe8b1-9dcd-549b-a840-12116441504b"
                  >
                    <div
                      className="size-10 rounded-xl text-white flex justify-center items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #B8A4E3 0%, #9580D4 100%)",
                        boxShadow: "0 6px 16px rgba(184,164,227,0.4)",
                      }}
                      data-id="fc927eab-7b24-5b8d-8b40-3ed2b8078d98"
                    >
                      <FileText
                        className="size-5"
                        data-id="42d66365-b62e-5ccb-951e-d0a471864505"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="size-9 rounded-full p-0"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.9)",
                      }}
                      data-id="73ff7f33-f176-599b-92b2-1bf3d25f5500"
                    >
                      <Download
                        className="size-4"
                        style={{ color: "#9580D4" }}
                        data-id="a4136ecd-7476-5d61-a222-3bef9c12ba2e"
                      />
                    </Button>
                  </div>
                  <div
                    className="flex mt-auto flex-col gap-1"
                    data-id="24850dc6-c34e-5890-b557-a17ab4c665a9"
                  >
                    <h3
                      className="leading-tight font-semibold text-base leading-6"
                      style={{ color: "#2D3748" }}
                      data-id="dd67ed2c-93b2-54ae-9ea3-364671407015"
                    >
                      Matrici e Determinanti
                    </h3>
                    <p
                      className="leading-snug text-xs leading-4"
                      style={{ color: "#9CA3AF" }}
                      data-id="f62999aa-3485-540b-8815-d3eab8cd40da"
                    >
                      Operazioni matriciali e calcolo determinanti.
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-id="3695d69d-242f-5a5d-b921-5072b3ad7a3f"
                  >
                    <span
                      className="font-bold rounded-full text-white text-[10px] px-2 py-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                      }}
                      data-id="033b603c-0f24-5175-afae-040e67df8631"
                    >
                      PDF
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="b825fe1e-4f32-55ed-adab-8d2a295ac0c2"
                    >
                      · 20 pagine
                    </span>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-3 overflow-hidden"
                  style={{
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    height: "200px",
                  }}
                  data-id="4f4c0f5d-fcc3-5f28-a55f-fe45413aa14f"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="394b7dbf-5215-5500-9ff8-c1cec712f024"
                  />
                  <div
                    className="flex justify-between items-start"
                    data-id="fa384637-17da-5623-9f45-aecf02de5895"
                  >
                    <div
                      className="size-10 rounded-xl text-white flex justify-center items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                        boxShadow: "0 6px 16px rgba(255,181,160,0.45)",
                      }}
                      data-id="ce51841c-ba85-51c5-948f-661c632dd1b7"
                    >
                      <FileText
                        className="size-5"
                        data-id="3722217b-b65f-5693-a851-defe47f89ea1"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="size-9 rounded-full p-0"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.9)",
                      }}
                      data-id="72981b09-a162-52d3-bb52-4b21928381c1"
                    >
                      <Eye
                        className="size-4"
                        style={{ color: "#FF9478" }}
                        data-id="961e7fea-ca1c-57a2-8d1a-348a29816de6"
                      />
                    </Button>
                  </div>
                  <div
                    className="flex mt-auto flex-col gap-1"
                    data-id="7ec58ee7-42fd-5d05-a3bd-69f1709b635d"
                  >
                    <h3
                      className="leading-tight font-semibold text-base leading-6"
                      style={{ color: "#2D3748" }}
                      data-id="f8b9a08e-2379-5e10-98e6-0f4e11ab6987"
                    >
                      Serie Numeriche
                    </h3>
                    <p
                      className="leading-snug text-xs leading-4"
                      style={{ color: "#9CA3AF" }}
                      data-id="e8e3c308-3d8e-5294-b420-dbddb2260e86"
                    >
                      Convergenza e criteri delle serie.
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-id="dbd10b4a-a35d-576e-8a04-a5d94eff7233"
                  >
                    <span
                      className="font-bold rounded-full text-white text-[10px] px-2 py-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                      }}
                      data-id="6c81fb57-9b05-501c-a1ef-89b2fd01b4ed"
                    >
                      PDF
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="344dff8e-075b-5ca2-b083-197967ce7e3f"
                    >
                      · 14 pagine
                    </span>
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </div>
        <div
          className="fixed right-8 bottom-8"
          data-id="18c09000-36ee-5ab9-adcb-848b433d49c4"
        >
          <Button
            className="transition-all duration-300 ease-out font-semibold rounded-full text-white px-6 gap-2 h-14"
            style={{
              background:
                "linear-gradient(135deg, #B8A4E3 0%, #A8D5BA 50%, #FFB5A0 100%)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow:
                "0 16px 40px rgba(184,164,227,0.45), 0 8px 20px rgba(168,213,186,0.25)",
            }}
            data-id="a0cf6429-c163-515b-a02d-03f595f6fd53"
          >
            <Plus
              className="size-5"
              data-id="c836e79f-e57f-56fe-94ab-33bd528b4e78"
            />
            Carica Appunti
          </Button>
        </div>
      </div>
    </div>
  );
}
