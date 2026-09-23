-- Migration: Seed test data for Quality Service Platform
-- Brands: IBM, NVIDIA, APPLE
-- Users: Juan (specialist), Carla (specialist), Miguel (team_lead), Lorena (team_lead)
-- Brand-Users mappings and realistic domain replies for customer complaints

-- ============================================================================
-- 1. BRANDS: IBM, NVIDIA, APPLE
-- ============================================================================
INSERT INTO public.tbrand (id, code, name, procedures_summary, created_by)
VALUES
    (
        'bbbbbbbb-1111-0000-0000-000000000001',
        'BRD-IBM',
        'IBM',
        'Standard Enterprise SLA applies. All enterprise server, mainframe, and cloud storage complaints must include hardware telemetry, syslogs, and authorized account authorization before escalation. Zero tolerance for unverified data-loss claims.',
        'migration_seed'
    ),
    (
        'bbbbbbbb-2222-0000-0000-000000000002',
        'NVIDIA',
        'NVIDIA',
        'Consumer GeForce and enterprise compute hardware protocols. For thermal or performance complaints, verify PSU wattage, 12VHPWR connector seating, airflow clearance, and clean driver installations using DDU before RMA processing.',
        'migration_seed'
    ),
    (
        'bbbbbbbb-3333-0000-0000-000000000003',
        'APPLE',
        'APPLE',
        'Premium customer experience protocol. Validate AppleCare coverage, serial verification, and diagnostic logs via Apple Service Toolkit. Differentiate strictly between manufacturing hardware faults and physical/liquid abuse.',
        'migration_seed'
    )
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    procedures_summary = EXCLUDED.procedures_summary;

-- ============================================================================
-- 2. USERS: Juan, Carla, Miguel, Lorena
-- ============================================================================
INSERT INTO public.tuser (id, account, name, role, created_by)
VALUES
    (
        'aaaaaaaa-1111-0000-0000-000000000001',
        'juan@qualityservice.com',
        'Juan',
        'specialist',
        'migration_seed'
    ),
    (
        'aaaaaaaa-2222-0000-0000-000000000002',
        'carla@qualityservice.com',
        'Carla',
        'specialist',
        'migration_seed'
    ),
    (
        'aaaaaaaa-3333-0000-0000-000000000003',
        'miguel@qualityservice.com',
        'Miguel',
        'team_lead',
        'migration_seed'
    ),
    (
        'aaaaaaaa-4444-0000-0000-000000000004',
        'lorena@qualityservice.com',
        'Lorena',
        'team_lead',
        'migration_seed'
    )
ON CONFLICT (account) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;

-- ============================================================================
-- 3. USER-BRAND MAPPINGS (tbrand_user)
-- - Juan   -> IBM, NVIDIA
-- - Carla  -> NVIDIA, APPLE
-- - Miguel -> IBM, APPLE
-- - Lorena -> NVIDIA
-- ============================================================================
INSERT INTO public.tbrand_user (id, brand_id, user_id, created_by)
VALUES
    -- Juan -> IBM
    (
        'cccccccc-1111-0000-0000-000000000001',
        'bbbbbbbb-1111-0000-0000-000000000001',
        'aaaaaaaa-1111-0000-0000-000000000001',
        'migration_seed'
    ),
    -- Juan -> NVIDIA
    (
        'cccccccc-1111-0000-0000-000000000002',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-1111-0000-0000-000000000001',
        'migration_seed'
    ),
    -- Carla -> NVIDIA
    (
        'cccccccc-2222-0000-0000-000000000001',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-2222-0000-0000-000000000002',
        'migration_seed'
    ),
    -- Carla -> APPLE
    (
        'cccccccc-2222-0000-0000-000000000002',
        'bbbbbbbb-3333-0000-0000-000000000003',
        'aaaaaaaa-2222-0000-0000-000000000002',
        'migration_seed'
    ),
    -- Miguel -> IBM
    (
        'cccccccc-3333-0000-0000-000000000001',
        'bbbbbbbb-1111-0000-0000-000000000001',
        'aaaaaaaa-3333-0000-0000-000000000003',
        'migration_seed'
    ),
    -- Miguel -> APPLE
    (
        'cccccccc-3333-0000-0000-000000000002',
        'bbbbbbbb-3333-0000-0000-000000000003',
        'aaaaaaaa-3333-0000-0000-000000000003',
        'migration_seed'
    ),
    -- Lorena -> NVIDIA
    (
        'cccccccc-4444-0000-0000-000000000001',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-4444-0000-0000-000000000004',
        'migration_seed'
    )
ON CONFLICT (brand_id, user_id) DO NOTHING;

-- ============================================================================
-- 4. REPLIES FOR JUAN (6 replies across IBM and NVIDIA)
-- Styles: Condescending, Overly verbose, Direct/Professional, Disrespectful
-- ============================================================================
INSERT INTO public.treply (id, brand_id, specialist_id, reply_date, content, created_by)
VALUES
    -- Reply 1 (Juan | IBM | Style: Condescending | Improper use: Unindexed queries & root crash)
    (
        'dddddddd-1111-0000-0000-000000000001',
        'bbbbbbbb-1111-0000-0000-000000000001',
        'aaaaaaaa-1111-0000-0000-000000000001',
        NOW() - INTERVAL '6 days',
        'As anyone with basic database administration knowledge would realize, executing unrestricted cross-joins without indexing across three million records as root is obviously going to lock the buffer pool and cause the server instance to crash. Your server hardware is functioning flawlessly; the issue is that our software expects a baseline level of query hygiene from administrators. Next time, consult chapter 4 of the admin handbook before opening a priority ticket claiming the storage array is defective.',
        'migration_seed'
    ),

    -- Reply 2 (Juan | NVIDIA | Style: Overly Verbose / Taking too long | Case: RTX GPU crashing)
    (
        'dddddddd-1111-0000-0000-000000000002',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-1111-0000-0000-000000000001',
        NOW() - INTERVAL '5 days',
        'Thank you for reaching out to customer support regarding your graphics processing unit. Modern semiconductor architecture has advanced by leaps and bounds over the past two decades. With the advent of deep learning supersampling, specialized tensor processing arrays, and complex microarchitectural power delivery requirements, voltage ripple management must adhere strictly to ATX 3.0 transient load tolerances. When an unexpected system reboot occurs, one must contemplate the interplay of motherboard VRM phase switching, transient power spikes reaching up to double the total graphics power, and ambient chassis thermals. Having thoroughly analyzed the telemetry logs you provided across these multiple interconnected subsystems, we find that your 12VHPWR power cable was simply not pushed all the way in until it clicked. Please shut down your PC and plug the cable in completely.',
        'migration_seed'
    ),

    -- Reply 3 (Juan | IBM | Style: Direct, Well-Written & Professional | Case: Hybrid cloud replication latency)
    (
        'dddddddd-1111-0000-0000-000000000003',
        'bbbbbbbb-1111-0000-0000-000000000001',
        'aaaaaaaa-1111-0000-0000-000000000001',
        NOW() - INTERVAL '4 days',
        'Dear Customer, thank you for providing the diagnostic bundle regarding the replication delay between your on-premise Power10 environment and the IBM Cloud VPC cluster. We have identified that packet fragmentation over your IPSec tunnel is triggering MTU mismatch retransmissions. To resolve this: 1) Set your gateway MTU to 1420 bytes, 2) Restart the storage replication daemon via "systemctl restart ibm-repl", and 3) Verify queue drain using the attached diagnostic script. If latency does not drop below 15ms within one hour, please update this ticket for immediate level-3 engineering escalation.',
        'migration_seed'
    ),

    -- Reply 4 (Juan | NVIDIA | Style: Disrespectful / Rude | Improper use: Shag carpet & blocked fans)
    (
        'dddddddd-1111-0000-0000-000000000004',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-1111-0000-0000-000000000001',
        NOW() - INTERVAL '3 days',
        'You put a 450-watt gaming desktop directly on a high-pile shag carpet next to two shedding dogs with the bottom intake fans completely suffocated, and you actually expected it not to thermal throttle? The card is not defective; your setup is absurd. Remove the tower off the carpet, clean out the mountain of pet hair choking the heatsink, and read the installation manual before blaming our hardware for your lack of common sense.',
        'migration_seed'
    ),

    -- Reply 5 (Juan | IBM | Style: Overly Verbose | Case: Batch job memory consumption)
    (
        'dddddddd-1111-0000-0000-000000000005',
        'bbbbbbbb-1111-0000-0000-000000000001',
        'aaaaaaaa-1111-0000-0000-000000000001',
        NOW() - INTERVAL '2 days',
        'Regarding your performance concerns with your overnight batch processing jobs, memory management in high-throughput enterprise applications represents one of the most philosophically intriguing challenges in computer science. Historically, memory was allocated statically, leading to rigid constraints. With the introduction of modern runtime environments, generational garbage collection algorithms, and speculative memory reclamation strategies, understanding the delicate balance between tenured generational heaps, survivor spaces, and thread-local allocation blocks becomes paramount for system stability. We reviewed your ticket at great length, deliberated on your memory graph trends, and determined that you simply need to increase your max heap argument by passing "-Xmx16g" in your startup configuration script.',
        'migration_seed'
    ),

    -- Reply 6 (Juan | NVIDIA | Style: Direct, Well-Written & Professional | Case: CUDA OOM on PyTorch inference)
    (
        'dddddddd-1111-0000-0000-000000000006',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-1111-0000-0000-000000000001',
        NOW() - INTERVAL '1 day',
        'Hello, thank you for submitting the crash dump and traceback for the CUDA out-of-memory error encountered on your RTX 6000 Ada workstation. The issue is caused by unreleased cache fragments in PyTorch 2.2 when running mixed-precision attention heads without explicit cache clearing. We recommend: 1) Updating to CUDA 12.4 driver build 550.54, 2) Invoking "torch.cuda.empty_cache()" at the end of each inference batch, and 3) Setting the environment variable "PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True". This will resolve the fragmentation and eliminate the crash.',
        'migration_seed'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. REPLIES FOR CARLA (8 replies across NVIDIA and APPLE)
-- Styles: Direct/Professional, Disrespectful, Condescending, Overly verbose
-- ============================================================================
INSERT INTO public.treply (id, brand_id, specialist_id, reply_date, content, created_by)
VALUES
    -- Reply 1 (Carla | APPLE | Style: Direct & Professional | Case: MacBook battery drain during sleep)
    (
        'dddddddd-2222-0000-0000-000000000001',
        'bbbbbbbb-3333-0000-0000-000000000003',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '7 days',
        'Hello. We have reviewed your diagnostics log regarding abnormal battery drain while your MacBook Pro lid is closed. The telemetry reveals that two third-party daemon processes ("power-sync" and "cloud-monitor") are maintaining constant assertion wakelocks, preventing your system from entering Deep Sleep (standby). Please run "pmset -g assertions" in Terminal to confirm, disable "Wake for network access" under Settings > Battery > Options, and remove the offending background utilities. Your battery health is at 98% with zero hardware fault detected.',
        'migration_seed'
    ),

    -- Reply 2 (Carla | APPLE | Style: Disrespectful / Curt | Improper use: Phone dropped from 2nd floor balcony)
    (
        'dddddddd-2222-0000-0000-000000000002',
        'bbbbbbbb-3333-0000-0000-000000000003',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '6 days',
        'You dropped your iPhone from a second-story concrete balcony and you are seriously opening an official warranty claim arguing that Ceramic Shield glass is defective because it shattered on impact? Limited warranty covers manufacturer defects, not gross negligence or laws of gravity. Your warranty claim is completely denied. If you want it fixed, you will have to pay for a full out-of-warranty screen and rear chassis replacement.',
        'migration_seed'
    ),

    -- Reply 3 (Carla | NVIDIA | Style: Condescending | Improper use: Monitor plugged into motherboard HDMI)
    (
        'dddddddd-2222-0000-0000-000000000003',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '5 days',
        'It is genuinely fascinating how you managed to spend $1,200 on an enthusiast graphics card only to plug your display cable directly into the onboard HDMI port of your motherboard. The reason your games run at 8 frames per second is because you have been using the CPU integrated graphics all along, leaving the actual GPU idling. Please take two seconds to look at the back of your computer, locate the ports on the graphics card itself, and plug your monitor in there.',
        'migration_seed'
    ),

    -- Reply 4 (Carla | APPLE | Style: Overly Verbose | Improper use: Thick metal folio case blocking induction)
    (
        'dddddddd-2222-0000-0000-000000000004',
        'bbbbbbbb-3333-0000-0000-000000000003',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '4 days',
        'Thank you for contacting Apple Support regarding the charging behavior of your Apple Pencil on your iPad Pro. The magnetic inductive charging system engineered into modern iPad devices relies on resonant inductive coupling. When high-frequency alternating magnetic fields interact with the receiving secondary coil embedded inside the pencil, eddy currents and dielectric permeability must remain within extraordinarily tight millimetric tolerances. Non-certified third-party protective cases featuring dense metallic backplates and synthetic leather flaps introduce substantial magnetic field attenuation and air gaps exceeding the inverse-square law threshold for inductive power delivery. In short, remove the thick knock-off case from your iPad, place the Apple Pencil directly onto the magnetic connector, and it will charge immediately.',
        'migration_seed'
    ),

    -- Reply 5 (Carla | NVIDIA | Style: Direct, Well-Written & Professional | Case: Enterprise vGPU license sync)
    (
        'dddddddd-2222-0000-0000-000000000005',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '3 days',
        'Hello. Regarding your vGPU Software License Server synchronization failure in your air-gapped ESXi cluster: The issue occurs because the self-signed certificate on DLS appliance 3.1.0 expired. To resolve: 1) Download the updated root certificate bundle from the NVIDIA Enterprise Licensing Portal, 2) SSH into your DLS instance and execute "sudo /opt/nvidia/dls/bin/update-cert.sh --bundle /tmp/cert.pem", and 3) Ensure firewall port 7070 outbound is allowed for lease renew packets. We have verified your tenant entitlement and confirmed all 64 vGPU licenses remain fully valid.',
        'migration_seed'
    ),

    -- Reply 6 (Carla | APPLE | Style: Condescending | Case: Mac Studio warm during 8K render)
    (
        'dddddddd-2222-0000-0000-000000000006',
        'bbbbbbbb-3333-0000-0000-000000000003',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '2 days',
        'Apparently it came as a massive shock to discover that electrical components generating computational work actually dissipate thermal energy. When you export a 12-track 8K ProRes RAW video timeline using all 24 CPU cores and 76 GPU cores at 100% capacity, the aluminum chassis will become warm to the touch—that is by design, because aluminum is a conductor that radiates heat away from the silicon. Your device reached 74°C, which is well below the 100°C thermal envelope. Your Mac Studio is working exactly as designed.',
        'migration_seed'
    ),

    -- Reply 7 (Carla | NVIDIA | Style: Overly Verbose | Case: DisplayPort audio crackle)
    (
        'dddddddd-2222-0000-0000-000000000007',
        'bbbbbbbb-2222-0000-0000-000000000002',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '1 day',
        'We have thoroughly received your inquiry regarding intermittent high-frequency audio crackling emitted through your gaming monitor speakers when utilizing DisplayPort 1.4 connection protocols. The digital transmission of uncompressed LPCM multi-channel audio data packets multiplexed across DisplayPort micro-packet stream lanes requires microsecond-level clock synchronization between the display controller and the audio render engine in your operating system. When Windows audio buffer pools experience DPC latency jitter caused by stale energy management states or conflictive sound enhancement drivers, the DAC encounters underflow events. After deep investigation, this can be entirely corrected by doing a clean graphics driver installation and disabling "Exclusive Mode" in your Windows Sound Control Panel.',
        'migration_seed'
    ),

    -- Reply 8 (Carla | APPLE | Style: Disrespectful / Blunt | Improper use: Swimming with AirPods in pool)
    (
        'dddddddd-2222-0000-0000-000000000008',
        'bbbbbbbb-3333-0000-0000-000000000003',
        'aaaaaaaa-2222-0000-0000-000000000002',
        NOW() - INTERVAL '12 hours',
        'Taking your AirPods Pro swimming for 45 minutes in a chlorinated pool and then complaining that the microphones stopped working is completely ridiculous. The product documentation explicitly says "water resistant", not waterproof, and specifically warns against pressurized water, submersion, and chemical exposure like chlorine. Submersion instantly invalidates the warranty. We will not be issuing a replacement for a destroyed unit caused by your own negligence.',
        'migration_seed'
    )
ON CONFLICT (id) DO NOTHING;
