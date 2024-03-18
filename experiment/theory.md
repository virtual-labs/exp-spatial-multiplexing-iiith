# THEORY
### Spatial multiplexing is a technique used in wireless communication systems to transmit multiple data streams simultaneously over the same radio frequency channel. Instead of using different frequencies or time slots, spatial multiplexing equips multiple antennas at both the transmitter and receiver to create independent communication links. By exploiting the spatial dimension, it allows multiplexing of multiple data streams and hence provides an increased transmission rate (or improved spectral efficiency), making it a fundamental technique in modern wireless communication standards like Multiple Input Multiple Output (MIMO) systems.
### Assuming the knowledge of the channel state information (CSI) at the transmitter, we can convert the MIMO channel into multiple non-interfering parallel SISO channels via singular value decomposition (SVD) based pre-processing and post-processing at the transmitter and receiver, respectively.
### Consider a MIMO system with $N_t$ antennas at the transmitter and $N_r$ antennas at the receiver. Let the signal received at the receiver be 
```math
\mathbf{y} = \mathbf{Hx} + \mathbf{n},
```
### where $\mathbf{x}\in\mathbb{C}^{N_t\times1}$ is the transmitted signal vector, $\mathbf{H}\in\mathbb{C}^{N_r\times N_t}$ is the MIMO channel matrix, and $\mathbf{n}\in\mathbb{C}^{N_r\times1}$ is the AWGN noise with variance $\sigma_N^2$. Without loss of generality, we assume unit transmission power, i.e. $\mathbb{E}[\mathbf{x}^T\mathbf{x}]=1$.
### From matrix theory, the channel matrix can be decomposed using  SVD as
```math
 \mathbf{H} = \mathbf{USV}^H
```
### where $\mathbf{U}\in\mathbb{C}^{N_r\times N_r}$ and $\mathbf{V}\in\mathbb{C}^{N_t\times N_t}$ are unitary matrices (i.e $\mathbf{U}^H\mathbf{U}=1$ and $\mathbf{V}^H\mathbf{V}=1)$ and $\mathbf{S}\in\mathbb{C}^{N_r\times N_t}$ is a diagonal matrix with singular values as its entries. There exist $R$ singular values where $R$ is the rank of the matrix H. The received signal can now be written as
```math
 \mathbf{y} = \mathbf{USV}^H\mathbf{x} + \mathbf{n}
```
### 1) Pre-processing at the transmitter
###     > Let $\mathbf{x}=\mathbf{V\bar{x}}$
###     > The received signal is now modified as 
```math
\mathbf{y} = \mathbf{US}\mathbf{\bar{x}} + \mathbf{n}
```
### 2) Post-processing at the receiver
### > Let $\mathbf{y}=\mathbf{U}^H\mathbf{\bar{y}}$
### > The received signal is now modified as 
```math
\mathbf{\bar{y}} = \mathbf{S}\mathbf{\bar{x}} + \mathbf{\bar{n}}
```
### It can be observed from \eqref{final} that The transmit precoding and receiver shaping transform the MIMO channel into $R$ non-interfering parallel single-input single-output (SISO) channels with input $\mathbf{\bar{x}}$ and output $\mathbf{\bar{y}}$.
![MIMO](https://github.com/virtual-labs/exp-spatial-multiplexing-iiith/assets/81808633/0c9ba7d9-2af9-43ef-9981-a17486a3bbaf)
### The conversion process is summarized in the below figure.
![MIMO_block](https://github.com/virtual-labs/exp-spatial-multiplexing-iiith/assets/81808633/94b34b77-0d16-451d-a5ca-50c4c2d61e66)
## MIMO Capacity
### The capacity of a MIMO communication system can be expressed as
```math
\mathrm{C} = \sum_{i=1}^{R}B\log_2\left(1+\frac{P_ta_i^2}{R\sigma_n^2}\right),
```
### where $P_t$ is the total transmission power and $\sigma_n^2$ is the noise power.
