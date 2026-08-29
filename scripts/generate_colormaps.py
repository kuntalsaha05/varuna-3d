import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

def save_colormap_texture(name, cmap_name, output_path, width=256, height=1):
    cmap = plt.get_cmap(cmap_name)
    gradient = np.linspace(0, 1, width)
    colors = cmap(gradient)

    fig, ax = plt.subplots(figsize=(width / 100, height / 100))
    fig.patch.set_alpha(0)
    ax.set_axis_off()
    ax.imshow(colors[np.newaxis, :, :], aspect='auto')
    plt.savefig(output_path, dpi=100, bbox_inches='tight', pad_inches=0, transparent=True)
    plt.close(fig)
    print(f"Generated: {output_path}")

save_colormap_texture("cmocean_thermal", "inferno", "frontend/public/assets/colormaps/cmocean_thermal.png")
save_colormap_texture("cmocean_haline", "cividis", "frontend/public/assets/colormaps/cmocean_haline.png")
save_colormap_texture("cmocean_speed", "turbo", "frontend/public/assets/colormaps/cmocean_speed.png")
save_colormap_texture("cmocean_algae", "YlGn", "frontend/public/assets/colormaps/cmocean_algae.png")