import React, { useState, useEffect, useRef } from 'react';
import styles from './Simulation.module.css';
import LineChart from '../../components/ui/chart/LineChart.jsx';
import Slider from '../../components/ui/slider/Slider.jsx';
import { getAllWorkspaces } from '../../api/services/workspaceService.js';
import { getAllRacks } from '../../api/services/rackService.js';
import Button from '../../components/ui/button/Button.jsx';
import { useToast } from '../../components/ui/toasts/ToastProvider.jsx';
import GenericSelector from '../../components/ui/selector/GenericSelector.jsx';
import { Play, Square,UndoDot } from 'lucide-react';

// Simulación simple: cada mes el coste = prev * (1 + random between -mult..+mult)

const monthsLabel = (n) => `M${n}`;

const Simulation = () => {
    const { showToast } = useToast();
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [racks, setRacks] = useState([]);
    const [racksLoading, setRacksLoading] = useState(false);
    const [selectedRack, setSelectedRack] = useState(null);

    const [baseCost, setBaseCost] = useState(100); // fallback

    // simulation parameters
    const [months, setMonths] = useState(12);
    const [multiplierPct, setMultiplierPct] = useState(5); // percent +/-
    const [speed, setspeed] = useState(400); // tick interval in ms
    const [running, setRunning] = useState(false);

    const [data, setData] = useState([]);
    const stepRef = useRef(0);
    const timerRef = useRef(null);

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
        const cost = selectedRack.totalMaintenanceCost ?? selectedRack.totalCost ?? selectedRack.maintenanceCost ?? 100;
        setBaseCost(Number(cost));
    }, [selectedRack]);

    useEffect(() => {
        if (running) {
            // prepare initial data
            stepRef.current = 0;
            setData([{ label: monthsLabel(0), value: baseCost }]);

            timerRef.current = setInterval(() => {
                stepRef.current += 1;
                setData(prev => {
                    const prevValue = prev.length ? prev[prev.length - 1].value : baseCost;
                    const m = multiplierPct / 100;
                    const delta = (Math.random() * 2 - 1) * m; // between -m and +m
                    const next = prevValue * (1 + delta);
                    const newList = [...prev, { label: monthsLabel(stepRef.current), value: Number(next.toFixed(2)) }];
                    // limit length
                    return newList.slice(-Math.max(months, 1));
                });
                if (stepRef.current >= months) {
                    setRunning(false);
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
        if (running) setRunning(false);
        else {
            // reset and start
            setData([{ label: monthsLabel(0), value: Number(baseCost) }]);
            stepRef.current = 0;
            setRunning(true);
        }
    };

    const handleReset = () => {
        setRunning(false);
        setData([{ label: monthsLabel(0), value: Number(baseCost) }]);
        stepRef.current = 0;
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}><h1>Simulation (wip)</h1></div>

            <div className={styles.content}>
                <div className={styles.left}>
                    <div className={styles.controlsCard}>
                        <GenericSelector
                            selectorTitle='Selecciona un Workspace'
                            availableItems={workspaces}
                            compatibleItems={selectedWorkspace ? [selectedWorkspace] : []}
                            singleSelection={true}
                            isLoading={workspaces.length === 0}
                            onAddComponent={(item) => setSelectedWorkspace(item)}
                            onRemoveComponent={() => setSelectedWorkspace(null)}
                        />
                        <GenericSelector
                            selectorTitle='Selecciona un Rack'
                            availableItems={selectedWorkspace ? racks : []}
                            compatibleItems={selectedRack ? [selectedRack] : []}
                            singleSelection={true}
                            isLoading={racksLoading}
                            onAddComponent={(item) => setSelectedRack(item)}
                            onRemoveComponent={() => setSelectedRack(null)}
                        />

                        <div className={styles.formRow}>
                            <div>
                                <label>Base Maintenance Cost</label>
                                <input type="number" value={baseCost} onChange={(e) => setBaseCost(Number(e.target.value))} />
                            </div>
                        </div>

                        <div className={styles.sliderRow}>
                            <label>Random multiplier ±{multiplierPct}%</label>
                            <Slider value={multiplierPct} min={0} max={100} onChange={(e) => setMultiplierPct(Number(e.target.value))} />
                        </div>

                        <div className={styles.sliderRow}>
                            <label>Simulation delay (s per month): {speed}s</label>
                            <Slider value={speed} min={1} max={5} onChange={(e) => setspeed(Number(e.target.value))} />
                        </div>

                        <div className={styles.formRowControls}>
                            <Button
                                variant={running ? 'danger' : 'primary'}
                                onClick={handleStartStop}>
                                {running ? <Square size={20} /> :
                                    <Play size={20} />}
                            </Button>
                            <Button variant='danger' onClick={handleReset}><UndoDot size={20}/></Button>
                        </div>
                    </div>
                </div>

                <div className={styles.right}>
                    <div className={styles.chartCard}>
                        <h3>Cost / Time (month-by-month)</h3>
                        <LineChart data={data} width={1400} height={754} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulation;
