import { useEffect } from "react";
import {
  Atom,
  BookMarked,
  BookOpen,
  Brain,
  ChevronRight,
  Code2,
  Compass,
  Dna,
  FileText,
  FlaskConical,
  GraduationCap,
  Landmark,
  Languages,
  LayoutGrid,
  Microscope,
  Palette,
  Plus,
  ScrollText,
  Search,
  Share2,
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
        data-id="bae1c96b-5b1c-5b16-9302-8448cf363c5f"
      >
        <div
          className="flex w-285 h-239"
          data-id="0654c5ed-7a90-5d82-bd17-1cac73825e53"
        >
          <aside
            className="flex p-6 flex-col items-center gap-8 w-55 h-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderRight: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "4px 0 30px rgba(139,127,180,0.08)",
            }}
            data-id="de2dcf40-1bf0-5fff-91f3-00b231403b18"
          >
            <div
              className="flex items-center gap-2 w-full"
              data-id="9ee2c3b2-9492-5fc7-b625-6b1859c4aaa7"
            >
              <div
                className="size-9 transition-all duration-300 rounded-xl flex justify-center items-center"
                style={{
                  background:
                    "linear-gradient(135deg, #A8D5BA 0%, #B8A4E3 50%, #FFB5A0 100%)",
                  boxShadow: "0 8px 24px rgba(184,164,227,0.35)",
                }}
                data-id="48211cda-9dd9-55f5-8e75-4c885a2d31b7"
              >
                <GraduationCap
                  className="size-5 text-white"
                  data-id="edee1cc5-97a4-5298-81d6-48a802ae0dd9"
                />
              </div>
              <span
                className="font-extrabold text-lg leading-7 tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #6B7B8C 0%, #B8A4E3 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                data-id="c9596393-d01d-560a-bfbf-91885ff0bf22"
              >
                SKAKK-UP
              </span>
            </div>
            <nav
              className="flex flex-col gap-2 w-full"
              data-id="5c6350b1-a00b-564d-af4f-87f6c99052e9"
            >
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{ color: "#6B7280" }}
                data-id="cf850c28-c8d2-5f44-927b-15a34195f010"
              >
                <LayoutGrid
                  className="size-4"
                  data-id="a954ea29-f4f9-5b28-8962-efb712faad4b"
                />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{
                  backgroundColor: "rgba(168,213,186,0.18)",
                  color: "#2D3748",
                  border: "1px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 4px 16px rgba(168,213,186,0.25)",
                }}
                data-id="0f6e259b-d692-5376-8caa-1f381098e957"
              >
                <BookOpen
                  className="size-4"
                  style={{ color: "#7AB89A" }}
                  data-id="6e542d0b-e763-56bb-a16c-09f730674a0b"
                />
                Materie
              </Button>
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{ color: "#6B7280" }}
                data-id="03ea3030-00d4-5460-9986-9f4b63846d09"
              >
                <FileText
                  className="size-4"
                  data-id="666b5b5d-2b7f-5136-854e-cdad973c4843"
                />
                Appunti
              </Button>
              <Button
                variant="ghost"
                className="transition-all duration-300 ease-out justify-start gap-2 w-full"
                style={{ color: "#6B7280" }}
                data-id="1c6e4f5c-5f7a-54fc-a46c-a1fa0b6da5a2"
              >
                <Share2
                  className="size-4"
                  data-id="13631a30-8e27-5424-a6c2-83a53301d899"
                />
                Condivisi
              </Button>
            </nav>
          </aside>
          <div
            className="flex flex-col flex-1"
            data-id="120b6312-90e0-531e-985d-a43483e1ac5d"
          >
            <header
              className="flex px-8 justify-between items-center h-16"
              style={{
                backgroundColor: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                borderBottom: "1px solid rgba(255,255,255,0.9)",
              }}
              data-id="0dae949d-9233-5001-9bda-65958d25fe7e"
            >
              <div
                className="flex items-center gap-2"
                data-id="f4e58b0d-1d31-522d-9e2e-4898c38d5cbc"
              >
                <Compass
                  className="size-5"
                  style={{ color: "#B8A4E3" }}
                  data-id="3ef3515a-41f2-56aa-b38c-84e60e6f728b"
                />
                <span
                  className="font-medium text-sm leading-5"
                  style={{ color: "#9CA3AF" }}
                  data-id="986a17af-151b-57bd-ba35-31b4f4f9bfc8"
                >
                  Esplora
                </span>
                <ChevronRight
                  className="size-4"
                  style={{ color: "#9CA3AF" }}
                  data-id="c89ad36d-0089-5ade-a245-e9e08537b1ae"
                />
                <span
                  className="font-semibold text-sm leading-5"
                  style={{ color: "#2D3748" }}
                  data-id="08f6d688-efb4-59aa-a57d-889ed7151c30"
                >
                  Materie
                </span>
              </div>
              <div
                className="relative w-120"
                data-id="492dcb63-7d2a-5f77-8bc8-e9bbcbe3182d"
              >
                <Search
                  className="top-1/2 -translate-y-1/2 size-4 absolute left-3"
                  style={{ color: "#B8A4E3" }}
                  data-id="30d2fca2-a0c1-5fdb-adc2-e4247c7d71e6"
                />
                <Input
                  placeholder="Cerca materia, argomento, autore…"
                  className="text-sm leading-5 pl-9 h-10"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 4px 20px rgba(139,127,180,0.10)",
                    color: "#2D3748",
                  }}
                  data-id="9164e88c-98ab-519f-89ff-1e9c932b7dc8"
                />
              </div>
              <div data-id="62210a67-a577-5a2c-98fe-ad8ba1288694" />
            </header>
            <main
              className="p-12 flex-1 overflow-hidden"
              data-id="abb39742-2cbd-5271-afb8-093b4397588a"
            >
              <div
                className="flex mb-8 justify-between items-end"
                data-id="1aa5c379-5d44-5d31-84b7-0920779aca74"
              >
                <div data-id="616658ad-0103-5b82-a9a6-baf734708ce9">
                  <h1
                    className="leading-tight font-extrabold text-[40px] tracking-tight"
                    style={{ color: "#2D3748" }}
                    data-id="b22bfde7-f83e-5c96-afd6-f5e13af14b75"
                  >
                    Esplora le Materie
                  </h1>
                  <p
                    className="text-base leading-6 mt-1"
                    style={{ color: "#9CA3AF" }}
                    data-id="aa839cfd-2e87-5976-b8f5-6974e0e36892"
                  >
                    Seleziona una disciplina per accedere agli appunti
                  </p>
                </div>
                <div
                  className="flex items-center gap-2"
                  data-id="9eaa6a61-5f8f-5eca-8b1a-c5166d594111"
                >
                  <Button
                    className="transition-all duration-300 ease-out font-medium rounded-full text-white text-sm leading-5 px-4 h-9"
                    style={{
                      background:
                        "linear-gradient(135deg, #B8A4E3 0%, #A8D5BA 100%)",
                      boxShadow: "0 8px 24px rgba(184,164,227,0.35)",
                      border: "1px solid rgba(255,255,255,0.6)",
                    }}
                    data-id="bca935ae-4c87-5003-999e-13b3471028df"
                  >
                    Tutti
                  </Button>
                  <Button
                    variant="outline"
                    className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      border: "1px solid rgba(255,255,255,0.95)",
                      color: "#6B7280",
                      boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    }}
                    data-id="45b7cce1-21fd-5046-afef-8432b5004c03"
                  >
                    Scientifiche
                  </Button>
                  <Button
                    variant="outline"
                    className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      border: "1px solid rgba(255,255,255,0.95)",
                      color: "#6B7280",
                      boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    }}
                    data-id="9a958340-4704-5e54-8f8e-b8f9df9092de"
                  >
                    Umanistiche
                  </Button>
                  <Button
                    variant="outline"
                    className="transition-all duration-300 ease-out rounded-full text-sm leading-5 px-4 h-9"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      border: "1px solid rgba(255,255,255,0.95)",
                      color: "#6B7280",
                      boxShadow: "0 4px 16px rgba(139,127,180,0.08)",
                    }}
                    data-id="ac8e6dba-5f21-5efd-a281-b178dce00b8f"
                  >
                    Lingue
                  </Button>
                </div>
              </div>
              <div
                className="grid grid-cols-4 gap-6"
                data-id="99a0b5cc-dec8-51ff-a9c3-4885c6cbd887"
              >
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="27850011-5421-52e1-a7c4-e235b7519861"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="f0357d4f-27fa-5d83-bd8d-4648debc475b"
                  />
                  <div
                    className="size-12 font-bold rounded-xl text-white text-2xl leading-8 flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #A8D5BA 0%, #7AB89A 100%)",
                      boxShadow: "0 8px 20px rgba(168,213,186,0.4)",
                    }}
                    data-id="5be9143b-3569-516f-a0fd-5ab4c07b24b4"
                  >
                    ∑
                  </div>
                  <div
                    className="mt-auto"
                    data-id="16e2bca3-d852-5094-9a3e-dd4d09104a51"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="e6bfbc2d-b029-5877-a89a-2d95ead167e5"
                    >
                      Matematica
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="748c187a-37df-5705-8a81-cd9d15727cc8"
                    >
                      87 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="6793c1c1-233a-5feb-bb7c-c29149ec153e"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="0b7bd058-7e83-5806-8b10-00f093079d6f"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #B8A4E3 0%, #9580D4 100%)",
                      boxShadow: "0 8px 20px rgba(184,164,227,0.4)",
                    }}
                    data-id="f0aa5e64-e9f6-5662-877e-c15baf9853cf"
                  >
                    <Atom
                      className="size-6"
                      data-id="c58c1cd3-33de-5beb-bb67-00f61fe64eda"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="dde111dc-dfe3-5c3c-ad0a-d86f1bca4846"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="06130475-611d-5019-85af-f419a3b4bc63"
                    >
                      Fisica
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="b0d08a5a-5360-58a4-8602-f8cf6c154810"
                    >
                      64 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="03da6426-56d3-578e-876b-58e155a875c7"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="6159e946-7465-5bfb-b2d9-f00456dea250"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFB5A0 0%, #FF9478 100%)",
                      boxShadow: "0 8px 20px rgba(255,181,160,0.45)",
                    }}
                    data-id="79f4867f-7947-571d-a470-fd83b6950edc"
                  >
                    <FlaskConical
                      className="size-6"
                      data-id="68de3658-abbe-5a5d-a7f1-1ccfa35b6438"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="aac7485a-8672-5209-8290-dff48df9783d"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="672944c6-f8bc-5451-ad72-7821fab289f2"
                    >
                      Chimica
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="29d40062-f4b4-50d9-83a2-0d114a49ac82"
                    >
                      52 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="a72169d1-f6c3-5a04-97b9-e425c17988e1"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="e6fc7b3c-60f8-5f2b-abf3-6f76c65ef90a"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #A8D5BA 0%, #8DCFB5 100%)",
                      boxShadow: "0 8px 20px rgba(168,213,186,0.4)",
                    }}
                    data-id="17e7f829-91a6-5a02-b893-1f4af3825c6a"
                  >
                    <Dna
                      className="size-6"
                      data-id="9538286e-bf8f-5df9-a109-fea5d95454d1"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="2483feb8-0f4b-5da8-9414-e0fece5c7fbb"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="b019a384-b96b-529b-bd0b-b764e4812f89"
                    >
                      Biologia
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="1f710ef9-0a07-5d6f-873d-c20da5cbe2fc"
                    >
                      73 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="cf98649f-1802-50cb-b4fc-509b3a7903a5"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="b24f86f3-8f59-5c3b-b28d-294baa04b764"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFB5A0 0%, #FFA288 100%)",
                      boxShadow: "0 8px 20px rgba(255,181,160,0.45)",
                    }}
                    data-id="aeba72a7-1fe1-5883-8dba-c2e9b81a496c"
                  >
                    <BookMarked
                      className="size-6"
                      data-id="d9d48186-9921-5c75-b0c1-985134db0d0c"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="bb8961ad-2e1d-57db-a01d-9f37fb9136bb"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="23216b22-5e5c-577a-a433-158035425152"
                    >
                      Italiano
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="a68d2a74-1772-5687-ae97-851e2c0b7bff"
                    >
                      96 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="d5982ef6-9e50-516e-ab94-04d288e6a68a"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="8ccc3f67-039c-5c00-8576-c92bd5a52dda"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #B8A4E3 0%, #A28BD9 100%)",
                      boxShadow: "0 8px 20px rgba(184,164,227,0.4)",
                    }}
                    data-id="74957962-0e7d-5ce6-8155-772eb13b2dc4"
                  >
                    <ScrollText
                      className="size-6"
                      data-id="2be0d018-b627-5f3a-9fac-2e57dfb25dec"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="4b8bff76-2c11-57d0-ae84-159a158a0922"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="f851655c-1ce5-57be-988a-0ef9522d60c7"
                    >
                      Latino
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="1411c7d5-e118-56bf-b438-b9d051ba6e5a"
                    >
                      41 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="2768031b-379e-59c5-9b61-f4136c5fd321"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="89dd6294-c666-5cf5-8654-7d1dab0cb20c"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFB5A0 0%, #F89880 100%)",
                      boxShadow: "0 8px 20px rgba(255,181,160,0.45)",
                    }}
                    data-id="09d5b973-949f-5a97-8555-4d3206c5c243"
                  >
                    <Landmark
                      className="size-6"
                      data-id="e12cdcd3-f956-54d3-ad0a-47176cee5f2a"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="cecc91fc-e13b-5660-b906-c90beebf5067"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="237a194c-3c30-581c-afdd-94656ff1490e"
                    >
                      Storia
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="69b49d46-291d-5685-aa4b-1f78b2832688"
                    >
                      58 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="fa145571-2595-5a79-adf5-97d915abc0b8"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="7cbe2670-5968-5edb-855c-828b46be9dab"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #B8A4E3 0%, #C8B4F0 100%)",
                      boxShadow: "0 8px 20px rgba(184,164,227,0.4)",
                    }}
                    data-id="89a5fffd-84d8-55ef-84bb-3640608523ed"
                  >
                    <Brain
                      className="size-6"
                      data-id="6e278bf8-6b13-569e-91d6-40e8316077c8"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="2cc42f68-388d-5c52-aeea-83c34504b968"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="aab791d8-100b-509b-bc85-15d6744d094b"
                    >
                      Filosofia
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="aaf6a31a-7a8b-5433-a2c1-c5a442109ccb"
                    >
                      47 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="37a96e3f-6a34-54cf-9da4-61e878441e04"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="90fa5f75-b9d5-509e-afba-a7a71c9cc036"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #A8D5BA 0%, #BFE3CC 100%)",
                      boxShadow: "0 8px 20px rgba(168,213,186,0.4)",
                    }}
                    data-id="f000046d-84ed-51f7-9d58-2fe05e95409a"
                  >
                    <Languages
                      className="size-6"
                      data-id="5b9e5a6b-7663-52e1-a0c2-da59fb594701"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="93e9f4bc-abb6-59b3-a339-6c3b10115f4c"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="d484183e-4932-580e-a40b-c035c561b3e4"
                    >
                      Inglese
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="06988432-091c-50fd-a270-167c36de43f5"
                    >
                      82 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="4a5d4da8-3ad4-5fc0-af0b-ef2e19abf0e1"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="d9a8e7eb-96de-5a27-86bd-dfd108e92b71"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #B8A4E3 0%, #A8D5BA 100%)",
                      boxShadow: "0 8px 20px rgba(184,164,227,0.4)",
                    }}
                    data-id="4b69a5d7-041d-5265-b46c-bb3e1f2daadb"
                  >
                    <Code2
                      className="size-6"
                      data-id="2f806898-e84b-582d-a2ee-ba08e497797f"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="7e8f4297-b32f-518a-bd31-4c14276c1cde"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="b47b1d86-839b-5719-a99b-226672ac3005"
                    >
                      Informatica
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="42348eb9-49de-51fb-b004-7ef56c5e552f"
                    >
                      69 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="c7bcf5ee-e71a-5194-95ce-747d2a9b5f58"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="0dac63bf-4459-523b-933b-3a677c600270"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFB5A0 0%, #B8A4E3 100%)",
                      boxShadow: "0 8px 20px rgba(255,181,160,0.4)",
                    }}
                    data-id="17ce4cba-bf11-59d9-b26a-468c99c3f003"
                  >
                    <Palette
                      className="size-6"
                      data-id="e465dd2e-fdc5-5f3d-a166-11e2da6c1b59"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="bbdbb660-d69e-5fe8-86ad-4403fa53c827"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="500ca1fc-972b-5571-8bfd-f8c50be6f943"
                    >
                      Arte
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="bdc6b63a-720b-5e5f-ba04-e041781ccac7"
                    >
                      35 documenti
                    </p>
                  </div>
                </Card>
                <Card
                  className="relative transition-all duration-500 ease-out p-6 gap-4 overflow-hidden"
                  style={{
                    height: "180px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 12px 40px rgba(139,127,180,0.15), 0 4px 12px rgba(122,138,168,0.08)",
                    borderRadius: "20px",
                  }}
                  data-id="e88facb0-2daf-577d-8e44-0594ac163aa9"
                >
                  <div
                    className="h-1/2 pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    }}
                    data-id="590a8e86-77b6-51c7-8a9f-7dc925fbd0fe"
                  />
                  <div
                    className="size-12 rounded-xl text-white flex justify-center items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #A8D5BA 0%, #B8A4E3 100%)",
                      boxShadow: "0 8px 20px rgba(168,213,186,0.4)",
                    }}
                    data-id="2c556815-549a-5672-9297-75a80b763525"
                  >
                    <Microscope
                      className="size-6"
                      data-id="bd2ecd01-d425-5d05-9046-318dc152194f"
                    />
                  </div>
                  <div
                    className="mt-auto"
                    data-id="aabd3699-6ef5-529f-b6de-e8dd001eb9b4"
                  >
                    <h3
                      className="font-semibold text-lg leading-7"
                      style={{ color: "#2D3748" }}
                      data-id="a3b370cc-178f-559b-ac8b-b080a00261a3"
                    >
                      Scienze
                    </h3>
                    <p
                      className="text-[13px]"
                      style={{ color: "#9CA3AF" }}
                      data-id="f6d1450e-00e0-5522-9488-c7b3545c1c5e"
                    >
                      61 documenti
                    </p>
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </div>
        <div
          className="fixed right-8 bottom-8"
          data-id="969897f4-3a4b-5d8d-9f86-e535a29e9f61"
        >
          <Button
            className="transition-all duration-300 ease-out font-semibold rounded-full text-white px-6 gap-2 h-14"
            style={{
              background:
                "linear-gradient(135deg, #B8A4E3 0%, #A8D5BA 50%, #FFB5A0 100%)",
              boxShadow:
                "0 16px 40px rgba(184,164,227,0.45), 0 8px 20px rgba(168,213,186,0.25)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
            data-id="e9e4bca6-3d25-5f46-826c-98e068eedd8e"
          >
            <Plus
              className="size-5"
              data-id="3c4449ae-f057-52a5-8950-c07a19ffad18"
            />
            Carica Appunti
          </Button>
        </div>
      </div>
    </div>
  );
}
