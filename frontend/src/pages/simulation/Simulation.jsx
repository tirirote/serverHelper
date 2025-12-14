import React, { useState, useEffect, useRef } from 'react';
import styles from './Simulation.module.css';
import LineChart from '../../components/ui/chart/LineChart.jsx';
import Slider from '../../components/ui/slider/Slider.jsx';
import { getAllWorkspaces } from '../../api/services/workspaceService.js';
import { getAllRacks, updateRack } from '../../api/services/rackService.js';
import Button from '../../components/ui/button/Button.jsx';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import GenericSelector from '../../components/ui/selector/GenericSelector.jsx';
import { Play, Square, UndoDot, Info, Power, PowerOff, Wrench } from 'lucide-react';

// Simulación simple: cada mes el coste = prev * (1 + random between -mult..+mult)

const monthsLabel = (n) => `M${n}`;

const Simulation = () => {
    const { showToast } = useToast();
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [racks, setRacks] = useState([]);
    const [racksLoading, setRacksLoading] = useState(false);
    const [selectedRack, setSelectedRack] = useState(null);

    const [baseCost, setBaseCost] = useState(100); // fallback for maintenance base
    const [baseConsumption, setBaseConsumption] = useState(0); // derived consumption base

    // simulation parameters
    const [months, setMonths] = useState(12);
    const [multiplierPct, setMultiplierPct] = useState(5); // percent +/-
    const [speed, setspeed] = useState(1); // tick interval in s
    const [consumptionPct, setConsumptionPct] = useState(3); // percent of totalCost to consider as monthly consumption
    const [failureProbability, setFailureProbability] = useState(2); // percent per month
    const [running, setRunning] = useState(false);
    const [failed, setFailed] = useState(false);

    const [data, setData] = useState([]);
    const [summaryVisible, setSummaryVisible] = useState(false);
    const stepRef = useRef(0);
    const timerRef = useRef(null);

    const repairCost = Number(((selectedRack?.totalCost ?? 0) * 0.02).toFixed(2)) || 0;

    useEffect(() => {
        const load = async () => {
            try {
                const w = await getAllWorkspaces();
                setWorkspaces(w || []);
            } catch (err) {
                console.error('Error fetching workspaces for simulation', err);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!selectedWorkspace) {
            setRacks([]);
            setSelectedRack(null);
            return;
        }
        const loadRacks = async () => {
            setRacksLoading(true);
            try {
                const list = await getAllRacks(selectedWorkspace.name);
                setRacks(list || []);
            } catch (err) {
                console.error('Error loading racks for selected workspace', err);
            } finally {
                setRacksLoading(false);
            }
        };
        loadRacks();
    }, [selectedWorkspace]);

    useEffect(() => {
        if (!selectedRack) return;
        // pick base cost from rack
        const maintenance = selectedRack.totalMaintenanceCost ?? selectedRack.maintenanceCost ?? 100;
        const total = selectedRack.totalCost ?? 0;
        setBaseCost(Number(maintenance));
        setBaseConsumption(Number((total * (consumptionPct / 100)).toFixed(2)));
    }, [selectedRack, consumptionPct]);

    useEffect(() => {
        if (running) {
            // prepare initial data
            stepRef.current = 0;
            setData([{ label: monthsLabel(0), maintenance: baseCost, consumption: baseConsumption, total: Number((baseCost + baseConsumption).toFixed(2)) }]);

            timerRef.current = setInterval(() => {
                stepRef.current += 1;
                const failure = Math.random() < (failureProbability / 100);
                setData(prev => {
                    const prevMaintenance = prev.length ? prev[prev.length - 1].maintenance : baseCost;
                    const prevConsumption = prev.length ? prev[prev.length - 1].consumption : baseConsumption;
                    const m = multiplierPct / 100;
                    const deltaMaintenance = (Math.random() * 2 - 1) * m;
                    const deltaConsumption = (Math.random() * 2 - 1) * m;
                    let maintenanceNext = Number((prevMaintenance * (1 + deltaMaintenance)).toFixed(2));
                    let consumptionNext = Number((prevConsumption * (1 + deltaConsumption)).toFixed(2));
                    let repairCost = 0;

                    if (failure) {
                        repairCost = 0; // not applied until user repairs
                    }

                    const totalNext = Number((maintenanceNext + consumptionNext + repairCost).toFixed(2));
                    const newList = [...prev, { label: monthsLabel(stepRef.current), maintenance: maintenanceNext, consumption: consumptionNext, total: totalNext }];
                    // limit length
                    return newList.slice(-Math.max(months, 1));
                });
                if (failure) {
                    setRunning(false);
                    setFailed(true);
                    showToast('El rack ha fallado — repara para continuar', 'warning');
                }
                if (stepRef.current >= months) {
                    setRunning(false);
                    setSummaryVisible(true);
                }
            }, Math.max(50, speed * 1000));
            return () => clearInterval(timerRef.current);
        } else {
            // stopped
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [running, baseCost, multiplierPct, speed, months]);

    const handleStartStop = () => {
        if (!selectedRack) { showToast('Selecciona un rack para simular', 'warning'); return; }
        if (selectedRack.powerStatus !== 'On') { showToast('Enciende el rack antes de empezar la simulación', 'warning'); return; }
        if (failed) { showToast('El rack está dañado. Repara antes de continuar', 'warning'); return; }
        if (running) setRunning(false);
        else {
            // reset and start
            setSummaryVisible(false);
            setData([{ label: monthsLabel(0), maintenance: Number(baseCost), consumption: Number(baseConsumption), total: Number((baseCost + baseConsumption).toFixed(2)) }]);
            stepRef.current = 0;
            setRunning(true);
        }
    };

    const handleReset = () => {
        setRunning(false);
        setData([{ label: monthsLabel(0), maintenance: Number(baseCost), consumption: Number(baseConsumption), total: Number((baseCost + baseConsumption).toFixed(2)) }]);
        stepRef.current = 0;
    };

    const togglePower = async () => {
        if (!selectedRack) return;
        try {
            const newStatus = selectedRack.powerStatus === 'On' ? 'Off' : 'On';
            await updateRack(selectedRack.name, { powerStatus: newStatus });
            const updated = { ...selectedRack, powerStatus: newStatus };
            setSelectedRack(updated);
            // refresh racks array
            setRacks(racks.map(r => r.name === updated.name ? updated : r));
            showToast(`Rack ${updated.name} ${newStatus === 'On' ? 'encendido' : 'apagado'}`, 'success');
        } catch (err) {
            console.error('Error updating rack power status', err);
            showToast('Error al cambiar el estado del rack', 'error');
        }
    };

    const repairRack = () => {
        if (!selectedRack) return;

        setData(prev => {
            // append repair as part of maintenance for current month
            const last = prev[prev.length - 1] || { maintenance: baseCost, consumption: baseConsumption, total: baseCost + baseConsumption };
            const maintenanceNext = Number((last.maintenance + repairCost).toFixed(2));
            const totalNext = Number((maintenanceNext + last.consumption).toFixed(2));
            const newList = [...prev.slice(0, prev.length - 1), { ...last, maintenance: maintenanceNext, total: totalNext }];
            return newList;
        });
        setFailed(false);
        setSummaryVisible(false);
        setRunning(true);
        showToast('Rack reparado. Se ha añadido el coste de reparación', 'success');
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Simulación de Costes</h1>
                <div className={styles.headerButtons}>
                    <Button
                        variant="primary"
                        onClick={() => showToast('Ejecuta una simulación de costes para un rack', 'info')}
                    > <Info size={24} />
                    </Button>
                </div>
            </div>
            <div className={styles.sliders}>
                <Slider
                    title='Cost %'
                    value={multiplierPct}
                    min={0}
                    max={100}
                    onChange={(e) => setMultiplierPct(Number(e.target.value))}
                    disabled={!selectedRack || selectedRack.powerStatus !== 'On' || failed} />

                <Slider
                    title='Consumption %'
                    value={consumptionPct}
                    min={0}
                    max={20}
                    onChange={(e) => setConsumptionPct(Number(e.target.value))}
                    disabled={!selectedRack || selectedRack.powerStatus !== 'On' || failed} />

                <Slider
                    title='Failure %'
                    value={failureProbability}
                    min={0}
                    max={100}
                    onChange={(e) => setFailureProbability(Number(e.target.value))}
                    disabled={!selectedRack || selectedRack.powerStatus !== 'On' || failed} />

                <Slider
                    title='Delay'
                    value={speed}
                    min={1}
                    max={5}
                    onChange={(e) => setspeed(Number(e.target.value))}
                    disabled={!selectedRack || selectedRack.powerStatus !== 'On' || failed} />

            </div>

            <div className={styles.content}>
                <div className={styles.left}>
                    <div className={styles.controlsCard}>
                        <GenericSelector
                            selectorTitle='Workspace'
                            availableItems={workspaces}
                            compatibleItems={selectedWorkspace ? [selectedWorkspace] : []}
                            singleSelection={true}
                            isLoading={workspaces.length === 0}
                            onAddComponent={(item) => setSelectedWorkspace(item)}
                            onRemoveComponent={() => setSelectedWorkspace(null)}
                        />

                        <GenericSelector
                            selectorTitle='Rack'
                            availableItems={selectedWorkspace ? racks : []}
                            compatibleItems={selectedRack ? [selectedRack] : []}
                            singleSelection={true}
                            isLoading={racksLoading}
                            onAddComponent={(item) => setSelectedRack(item)}
                            onRemoveComponent={() => setSelectedRack(null)}
                        />

                        <div className={styles.formRow}>
                            <label>Mantenimiento: {baseCost}€/mes</label>
                        </div>

                        <div className={styles.formRow}>
                            <label>Consumo: {baseConsumption}€/mes</label>
                        </div>

                        <div className={styles.powerRow}>
                            {!selectedRack && <span>—</span>}
                            {selectedRack && selectedRack.powerStatus === 'On' && (
                                <span className={`${styles.statusBadge} ${styles.on}`}><Power size={24} /> Encendido</span>
                            )}
                            {selectedRack && selectedRack.powerStatus === 'Off' && (
                                <span className={`${styles.statusBadge} ${styles.off}`}><PowerOff size={24} /> Apagado</span>
                            )}
                            {selectedRack && !['On', 'Off'].includes(selectedRack.powerStatus) && (
                                <span className={`${styles.statusBadge} ${styles.unknown}`}><Info size={24} /> {selectedRack.powerStatus === 'Unknown' ? 'Desconocido' : selectedRack.powerStatus}</span>
                            )}
                            <Button
                                variant='icon-only'
                                onClick={togglePower}
                                disabled={!selectedRack}>
                                {selectedRack && selectedRack.powerStatus === 'On' ? (<PowerOff />) : (<Power />)}
                            </Button>
                        </div>


                        <div className={styles.formRowControls}>
                            <label>Acciones</label>
                            <div className={styles.buttonGroup}>
                                <Button
                                    variant='primary'
                                    onClick={handleStartStop}
                                    disabled={!selectedRack || selectedRack.powerStatus !== 'On' || failed}>
                                    {running ? <Square size={24} /> :
                                        <Play size={24} />}
                                </Button>
                                <Button
                                    variant='danger'
                                    onClick={handleReset}>
                                    <UndoDot size={24} />
                                </Button>
                            </div>
                            {failed &&
                                <Button
                                    variant='primary'
                                    onClick={repairRack}>
                                    {repairCost}€<Wrench />
                                </Button>}
                        </div>



                    </div>
                </div>

                <div className={styles.right}>
                    <div className={styles.chartCard}>
                        <h3>Cost / Time (month-by-month)</h3>
                        <div className={selectedRack && selectedRack.powerStatus !== 'On' ? styles.dimmed : ''}>
                            <LineChart data={data} width={1300} height={600} />
                        </div>
                        {selectedRack && selectedRack.powerStatus !== 'On' && (
                            <div className={styles.chartOverlay}>
                                <div>
                                    <h4>Power Off</h4>
                                    <p>Enciende el rack para ver la simulación</p>
                                </div>
                            </div>
                        )}
                        {failed && (
                            <div className={styles.chartOverlay}>
                                <div>
                                    <h4>Rack Dañado</h4>
                                    <p>Repara el rack para continuar la simulación</p>
                                </div>
                            </div>
                        )}
                        {/* Summary overlay shown when simulation naturally finishes */}
                        {!running && summaryVisible && !failed && selectedRack && stepRef.current >= months && data.length > 1 && (
                            <div className={styles.chartSummaryOverlay}>
                                <div className={styles.summaryCard}>
                                    <h4>Resumen de simulación</h4>
                                    <p>Rack: <strong>{selectedRack.name}</strong></p>
                                    <p>Meses simulados: <strong>{Math.min(stepRef.current, months)}</strong></p>
                                    {data.length > 0 && (() => {
                                        const final = data[data.length - 1];
                                        const sumMaintenance = data.reduce((acc, d) => acc + (d.maintenance || 0), 0);
                                        const sumConsumption = data.reduce((acc, d) => acc + (d.consumption || 0), 0);
                                        const totalAccum = Number((sumMaintenance + sumConsumption).toFixed(2));
                                        return (
                                            <>
                                                <p>Mantenimiento final: <strong>{final.maintenance}€</strong></p>
                                                <p>Consumo final: <strong>{final.consumption}€</strong></p>
                                                <p>Total final: <strong>{final.total}€</strong></p>
                                                <p>Coste acumulado: <strong>{totalAccum}€</strong></p>
                                            </>
                                        )
                                    })()}
                                    <div className={styles.summaryActions}>
                                        <Button variant="primary" onClick={() => setSummaryVisible(false)}>Cerrar</Button>
                                        <Button variant="primary" onClick={() => { setSummaryVisible(false); setData([{ label: monthsLabel(0), maintenance: Number(baseCost), consumption: Number(baseConsumption), total: Number((baseCost + baseConsumption).toFixed(2)) }]); stepRef.current = 0; }}>Reiniciar</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulation;
