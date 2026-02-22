Spatial multiplexing is a technique used in wireless communication systems to transmit multiple data streams simultaneously over the same radio frequency channel. Instead of using different frequencies or time slots, spatial multiplexing equips multiple antennas at both the transmitter and receiver to create independent communication links. By exploiting the spatial dimension of the wireless channel, spatial multiplexing significantly increases data throughput and spectral efficiency. It is a fundamental component of modern wireless standards, particularly in Multiple Input Multiple Output (MIMO) systems.

Assuming the knowledge of the channel state information (CSI) at the transmitter, we can convert the MIMO channel into multiple non-interfering parallel SISO channels via singular value decomposition (SVD) based pre-processing and post-processing at the transmitter and receiver, respectively.

Consider a MIMO system with $N_t$ antennas at the transmitter and $N_r$ antennas at the receiver. Let the signal received at the receiver be

$$\mathbf{y} = \mathbf{Hx} + \mathbf{n}$$

where $\mathbf{x}\in\mathbb{C}^{N_t\times1}$ is the transmitted signal vector, $\mathbf{H}\in\mathbb{C}^{N_r\times N_t}$ is the MIMO channel matrix, and $\mathbf{n}\in\mathbb{C}^{N_r\times1}$ is the AWGN noise with variance $\sigma_N^2$. Without loss of generality, we assume unit transmission power, i.e. $\mathbb{E}[\mathbf{x}^T\mathbf{x}]=1$.

---

## <span style="color:blue">Structure of the MIMO Channel Matrix</span>
<span style="color:blue">
The effectiveness of spatial multiplexing fundamentally depends on the structure and properties of the MIMO channel matrix. In particular, the rank of the channel matrix determines how many independent spatial data streams can be supported. This concept is closely related to the spatial Degrees of Freedom (DoF), which quantify the multiplexing capability of the system.
The channel matrix represents the spatial coupling between transmit and receive antennas, where each element denotes the complex channel gain from transmit antenna  to receive antenna. Each column corresponds to the spatial signature of a transmit antenna, while each row describes how a receive antenna observes all transmitted signals.


The structure of this matrix depends on antenna spacing, array geometry, propagation environment, scattering richness, and the presence or absence of Line-of-Sight (LoS) components. These factors directly influence the rank of the channel matrix and therefore the achievable spatial multiplexing performance.

---

## <span style="color:blue">Rank and Spatial Degrees of Freedom (DoF)</span>


The rank of the channel matrix is defined as

$$
R = \mathrm{rank}(\mathbf{H}),
$$


determines the number of independent spatial data streams that can be transmitted simultaneously.  It satisfies $R \leq \min(N_t, N_r)$. The spatial Degrees of Freedom (DoF) of the MIMO system are equal to the rank of $\mathbf{H}$. If $R = \min(N_t,N_r)$, full spatial multiplexing gain is achieved. If $R=1$, the system effectively behaves as a SISO channel regardless of the number of antennas. Therefore, spatial multiplexing capability is fundamentally limited by the rank of the channel matrix rather than merely by the number of antennas deployed.


---

<span style="color:blue">
Before applying SVD-based processing, the received signal components are coupled due to interference, commonly referred to as crosstalk.
</span>


Each receive antenna recieves

$$
y_i = \sum_{j=1}^{N_t} h_{ij} x_j + n_i,
$$


<span style="color:blue">
which shows that multiple transmitted streams interfere with one another. This crosstalk prevents direct separation of spatial streams without appropriate signal processing.
</span>

From matrix theory, the channel matrix can be decomposed using SVD as

$$\mathbf{H} = \mathbf{USV}^H$$

where $\mathbf{U}\in\mathbb{C}^{N_r\times N_r}$ and $\mathbf{V}\in\mathbb{C}^{N_t\times N_t}$ are unitary matrices (i.e $\mathbf{U}^H\mathbf{U}=1$ and $\mathbf{V}^H\mathbf{V}=1$) and $\mathbf{S}\in\mathbb{C}^{N_r\times N_t}$ is a diagonal matrix with singular values as its entries. There exist $R$ singular values where $R$ is the rank of the matrix $\mathbf{H}$. The received signal can now be written as

$$\mathbf{y} = \mathbf{USV}^H\mathbf{x} + \mathbf{n}$$

1) Pre-processing at the transmitter

    a) Let $\mathbf{x}=\mathbf{V\bar{x}}$

    b) The received signal is now modified as

$$\mathbf{y} = \mathbf{US}\mathbf{\bar{x}} + \mathbf{n}$$

2) Post-processing at the receiver

    a) Let $\mathbf{\bar{y}}=\mathbf{U}^H\mathbf{y}$

    b) The received signal is now modified as 
     
$$\mathbf{\bar{y}} = \mathbf{S}\mathbf{\bar{x}} + \mathbf{\bar{n}}$$

<span style="color:blue">
The above transformation diagonalizes the channel matrix and eliminates crosstalk between spatial streams. The MIMO system is therefore converted into $R$ parallel, non-interfering SISO channels
</span>


$$
\bar{y}_i = a_i \bar{x}_i + \bar{n}_i.
$$


It can be observed that the transmit precoding and receiver shaping transform the MIMO channel into $R$ non-interfering parallel single-input single-output (SISO) channels with input $\mathbf{\bar{x}}$ and output $\mathbf{\bar{y}}$.

---

## MIMO Capacity
The capacity of a MIMO communication system can be expressed as

$$\mathrm{C} = \sum_{i=1}^{R}B\log_2\left(1+\frac{P_ta_i^2}{R\sigma_n^2}\right)$$

where $P_t$ is the total transmission power and $\sigma_n^2$ is the noise power.

<span style="color:blue">
The capacity expression explicitly depends on $R$, the rank of the channel matrix. At high SNR, the capacity scales approximately as
</span>

<span style="color:blue">
$$
\mathrm{C} \approx R \log_2(\mathrm{SNR}),
$$
</span>

<span style="color:blue">
which demonstrates that the spatial Degrees of Freedom directly determine the multiplexing gain and the slope of capacity growth with SNR. Therefore, the rank of the MIMO channel matrix governs the number of parallel data streams, the achievable multiplexing gain, and the overall spatial efficiency of the system.
</span>
